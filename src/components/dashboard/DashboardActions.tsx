import { useState } from "react";
import { Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordingDialog } from "@/components/audio/RecordingDialog";
import { NewDocumentationDialog } from "@/components/documentation/NewDocumentationDialog";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useDocumentations } from "@/hooks/useDocumentations";
import { useAudioFiles } from "@/hooks/useAudioFiles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AudioFile } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export const DashboardActions = () => {
  const queryClient = useQueryClient();
  const { clients } = useClients();
  const { cases } = useCases();
  const { createDocumentation } = useDocumentations();
  const { addAudioFile } = useAudioFiles();
  
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [pendingAudioForDocumentation, setPendingAudioForDocumentation] = useState<AudioFile | null>(null);

  const handleStartRecording = () => {
    setShowRecordingDialog(true);
  };

  const handleSaveAudio = async (audioFile: AudioFile) => {
    try {
      if (!audioFile.blob) {
        toast.error("Kein Audio-Blob verfügbar");
        return;
      }

      // Erstelle File-Objekt mit MP3 als Format
      const fileName = audioFile.fileName.replace(/\.[^/.]+$/, '') + '.mp3';
      const file = new File([audioFile.blob], fileName, { type: 'audio/mp3' });

      // Lade Audio-Datei direkt in die DB hoch (ohne documentation_id)
      await addAudioFile({
        file,
        documentationId: null as any, // nullable now
        durationMs: audioFile.durationMs,
      });

      // Füge auch zum lokalen State hinzu für die Dokumenten-Erstellung
      setAudioFiles(prev => [...prev, audioFile]);
      
      toast.success("Audio-Datei gespeichert");
    } catch (error) {
      console.error("Fehler beim Speichern der Audio-Datei:", error);
      toast.error("Fehler beim Speichern der Audio-Datei");
    }
  };

  const handleSaveAudioAndCreateDocumentation = async (audioFile: AudioFile) => {
    try {
      if (!audioFile.blob) {
        toast.error("Kein Audio-Blob verfügbar");
        return;
      }

      // Erstelle File-Objekt mit MP3 als Format
      const fileName = audioFile.fileName.replace(/\.[^/.]+$/, '') + '.mp3';
      const file = new File([audioFile.blob], fileName, { type: 'audio/mp3' });

      // Lade Audio-Datei direkt in die DB hoch (ohne documentation_id)
      const uploadedAudio = await addAudioFile({
        file,
        documentationId: null as any, // nullable now
        durationMs: audioFile.durationMs,
      });

      // Aktualisiere audioFile mit der Datenbank-ID
      const audioFileWithId = { 
        ...audioFile, 
        id: uploadedAudio.id // Verwende die ID aus der Datenbank
      };
      
      // Füge zum lokalen State hinzu und speichere für Dokumenten-Dialog
      setAudioFiles(prev => [...prev, audioFileWithId]);
      setPendingAudioForDocumentation(audioFileWithId);
      
      toast.success("Audio-Datei gespeichert");
      
      // Öffne Dokumentations-Dialog
      setShowDocumentationDialog(true);
    } catch (error) {
      console.error("Fehler beim Speichern der Audio-Datei:", error);
      toast.error("Fehler beim Speichern der Audio-Datei");
    }
  };

  const handleNewDocumentation = () => {
    setPendingAudioForDocumentation(null);
    setShowDocumentationDialog(true);
  };

  const handleSaveDocumentation = async (documentation: any) => {
    try {
      // 1. Erstelle die Dokumentation
      console.log("Erstelle Dokumentation...");
      const { data: docData, error: docError } = await supabase
        .from("documentations")
        .insert({
          case_id: documentation.caseId,
          title: documentation.title,
          date: documentation.date,
          todos: documentation.todos || "",
          transcript_text: documentation.summaryText,
          summary_text: documentation.summaryText,
        })
        .select()
        .single();

      if (docError) {
        console.error("Fehler beim Erstellen der Dokumentation:", docError);
        throw docError;
      }

      console.log("Dokumentation erstellt:", docData.id);

      // 2. Verknüpfe Audio-Dateien
      if (documentation.audioFiles && documentation.audioFiles.length > 0) {
        console.log("Verknüpfe Audio-Dateien mit Dokumentation:", documentation.audioFiles.length, "Dateien");
        for (const audio of documentation.audioFiles) {
          try {
            // Prüfe ob die Audio-Datei bereits in der DB existiert (hat eine UUID als ID)
            const isExistingAudio = audio.id && audio.id.includes('-'); // UUID Format
            
            if (isExistingAudio) {
              // Audio-Datei existiert bereits - nur documentation_id aktualisieren
              console.log("Verknüpfe existierende Audio-Datei:", audio.id);
              const { error: updateError } = await supabase
                .from("audio_files")
                .update({ documentation_id: docData.id })
                .eq("id", audio.id);
              
              if (updateError) throw updateError;
              console.log("Audio-Datei verknüpft:", audio.id);
            } else if (audio.blob) {
              // Neue Audio-Datei mit Blob - hochladen
              console.log("Lade neue Audio-Datei hoch:", audio.fileName);
              
              const fileName = audio.fileName.replace(/\.[^/.]+$/, '') + '.mp3';
              const file = new File([audio.blob], fileName, { type: 'audio/mp3' });
              
              // Lade in Storage hoch
              const storagePath = `${docData.id}/${Date.now()}.mp3`;
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from("audio-files")
                .upload(storagePath, file, {
                  cacheControl: "3600",
                  upsert: false,
                });

              if (uploadError) throw uploadError;

              // Erstelle Datenbank-Eintrag
              const { error: audioDbError } = await supabase
                .from("audio_files")
                .insert({
                  documentation_id: docData.id,
                  file_name: fileName,
                  file_path: uploadData.path,
                  mime_type: 'audio/mp3',
                  duration_ms: audio.durationMs,
                });

              if (audioDbError) throw audioDbError;
              console.log("Neue Audio-Datei hochgeladen:", fileName);
            }
          } catch (error) {
            console.error("Fehler beim Verarbeiten der Audio-Datei:", error);
          }
        }
      }

      // 3. Lade Attachments hoch
      if (documentation.attachments && documentation.attachments.length > 0) {
        for (const attachment of documentation.attachments) {
          try {
            // Hole das Blob von der URL
            const response = await fetch(attachment.blobUrl);
            const blob = await response.blob();
            
            // Erstelle File-Objekt
            const file = new File([blob], attachment.fileName, { type: attachment.fileType });
            
            // Lade in Storage hoch
            const fileExt = attachment.fileName.split(".").pop();
            const fileName = `${docData.id}/${Date.now()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("attachments")
              .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) throw uploadError;

            // Erstelle Datenbank-Eintrag
            const { error: attachmentDbError } = await supabase
              .from("attachments")
              .insert({
                documentation_id: docData.id,
                file_name: attachment.fileName,
                file_path: uploadData.path,
                mime_type: attachment.fileType,
                size: attachment.size,
              });

            if (attachmentDbError) throw attachmentDbError;
            
            console.log("Attachment hochgeladen:", attachment.fileName);
          } catch (error) {
            console.error("Fehler beim Attachment-Upload:", error);
          }
        }
      }

      // Aktualisiere die Dokumentationsliste
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      
      toast.success("Dokumentation mit allen Dateien gespeichert");
      setShowDocumentationDialog(false);
    } catch (error) {
      console.error("Detaillierter Fehler beim Speichern:", error);
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
      toast.error(`Fehler beim Speichern: ${errorMessage}`);
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Aktionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleStartRecording}
            className="w-full inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium"
            variant="outline"
          >
            <Mic className="mr-2 h-4 w-4" />
            Neue Audioaufnahme starten
          </Button>
          <Button
            onClick={handleNewDocumentation}
            className="w-full inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium"
          >
            <FileText className="mr-2 h-4 w-4" />
            Neue Dokumentation anlegen
          </Button>
        </CardContent>
      </Card>

      <RecordingDialog
        open={showRecordingDialog}
        onOpenChange={setShowRecordingDialog}
        onSave={handleSaveAudio}
        onSaveAndCreateDocumentation={handleSaveAudioAndCreateDocumentation}
      />

      <NewDocumentationDialog
        open={showDocumentationDialog}
        onOpenChange={(open) => {
          setShowDocumentationDialog(open);
          if (!open) setPendingAudioForDocumentation(null);
        }}
        clients={clients}
        setClients={() => {}}
        cases={cases}
        setCases={() => {}}
        audioFiles={pendingAudioForDocumentation ? [...audioFiles, pendingAudioForDocumentation] : audioFiles}
        onSave={handleSaveDocumentation}
        initialSelectedAudioIds={pendingAudioForDocumentation ? [pendingAudioForDocumentation.id] : []}
      />
    </>
  );
};
