import { useState } from "react";
import { Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordingDialog } from "@/components/audio/RecordingDialog";
import { NewDocumentationDialog } from "@/components/documentation/NewDocumentationDialog";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useDocumentations } from "@/hooks/useDocumentations";
import type { AudioFile } from "@/types";

export const DashboardActions = () => {
  const { clients } = useClients();
  const { cases } = useCases();
  const { createDocumentation } = useDocumentations();
  
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false);

  const handleStartRecording = () => {
    setShowRecordingDialog(true);
  };

  const handleSaveAudio = (audioFile: AudioFile) => {
    // Audio files will be handled through documentation uploads
    console.log("Audio-Datei wird über Dokumentation gespeichert");
  };

  const handleNewDocumentation = () => {
    setShowDocumentationDialog(true);
  };

  const handleSaveDocumentation = async (documentation: any) => {
    try {
      await createDocumentation({
        case_id: documentation.caseId,
        title: documentation.title,
        date: documentation.date,
        todos: documentation.todos || "",
      });
      setShowDocumentationDialog(false);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
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
        audioFiles={[]}
        onSave={handleSaveDocumentation}
      />
    </>
  );
};
