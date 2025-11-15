import { useState } from "react";
import { Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordingDialog } from "@/components/audio/RecordingDialog";
import { NewDocumentationDialog } from "@/components/documentation/NewDocumentationDialog";
import { AudioFile, Client, Case, Documentation } from "@/types";

interface DashboardActionsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  audioFiles: AudioFile[];
  setAudioFiles: React.Dispatch<React.SetStateAction<AudioFile[]>>;
  onSaveDocumentation: (documentation: Documentation) => void;
}

export const DashboardActions = ({
  clients,
  setClients,
  cases,
  setCases,
  audioFiles,
  setAudioFiles,
  onSaveDocumentation,
}: DashboardActionsProps) => {
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [showDocumentationDialog, setShowDocumentationDialog] = useState(false);

  const handleStartRecording = () => {
    setShowRecordingDialog(true);
  };

  const handleSaveAudio = (audioFile: AudioFile) => {
    setAudioFiles((prev) => [...prev, audioFile]);
    console.log("Neue Audio-Datei gespeichert:", audioFile);
  };

  const handleNewDocumentation = () => {
    setShowDocumentationDialog(true);
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
        setClients={setClients}
        cases={cases}
        setCases={setCases}
        audioFiles={audioFiles}
        onSave={onSaveDocumentation}
      />
    </>
  );
};
