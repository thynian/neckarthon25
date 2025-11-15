import { useState } from "react";
import { Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordingDialog } from "@/components/audio/RecordingDialog";
import { NewDocumentationDialog } from "@/components/documentation/NewDocumentationDialog";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useDocumentations } from "@/hooks/useDocumentations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AudioFile } from "@/types";

export const DashboardActions = () => {
  const { clients } = useClients();
  const { cases } = useCases();
  const { createDocumentation } = useDocumentations();
  
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  const handleStartRecording = () => {
    setShowRecordingDialog(true);
  };

  const handleSaveAudio = (audioFile: AudioFile) => {
    setAudioFiles(prev => [...prev, audioFile]);
    console.log("Audio-Datei gespeichert:", audioFile.fileName);
  };

  const handleNewDocumentation = () => {
    setShowDocumentationDialog(true);
  };

  const handleSaveDocumentation = async (documentation: any) => {
    try {
      // 1. Erstelle die Dokumentation
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

      if (docError) throw docError;

      console.log("Dokumentation erstellt:", docData.id);

      // 2. Lade Audio-Dateien hoch
      if (documentation.audioFiles && documentation.audioFiles.length > 0) {
        for (const audio of documentation.audioFiles) {
          try {
            // Hole das Blob von der URL
            const response = await fetch(audio.blobUrl);
            const blob = await response.blob();
            
            // Erstelle File-Objekt mit MP3 als Format
            const fileName = audio.fileName.replace(/\.[^/.]+$/, '') + '.mp3';
            const file = new File([blob], fileName, { type: 'audio/mp3' });
            
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
            
            console.log("Audio-Datei hochgeladen:", fileName);
          } catch (error) {
            console.error("Fehler beim Audio-Upload:", error);
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

      toast.success("Dokumentation mit allen Dateien gespeichert");
      setShowDocumentationDialog(false);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern der Dokumentation");
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
      />

      <NewDocumentationDialog
        open={showDocumentationDialog}
        onOpenChange={setShowDocumentationDialog}
        clients={clients}
        setClients={() => {}}
        cases={cases}
        setCases={() => {}}
        audioFiles={audioFiles}
        onSave={handleSaveDocumentation}
      />
    </>
  );
};
