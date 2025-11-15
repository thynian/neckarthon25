import { useState } from "react";
import { Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordingDialog } from "@/components/audio/RecordingDialog";
import { AudioFile } from "@/types";

interface DashboardActionsProps {
  setAudioFiles: React.Dispatch<React.SetStateAction<AudioFile[]>>;
}

export const DashboardActions = ({ setAudioFiles }: DashboardActionsProps) => {
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);

  const handleStartRecording = () => {
    setShowRecordingDialog(true);
  };

  const handleSaveAudio = (audioFile: AudioFile) => {
    setAudioFiles((prev) => [...prev, audioFile]);
    console.log("Neue Audio-Datei gespeichert:", audioFile);
  };

  const handleNewDocumentation = () => {
    console.log("Neue Dokumentation anlegen - noch nicht implementiert");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              size="lg"
              onClick={handleStartRecording}
              className="h-24 text-lg"
            >
              <Mic className="mr-3 h-6 w-6" />
              Neue Audioaufnahme starten
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleNewDocumentation}
              className="h-24 text-lg"
            >
              <FileText className="mr-3 h-6 w-6" />
              Neue Dokumentation anlegen
            </Button>
          </div>
        </CardContent>
      </Card>

      <RecordingDialog
        open={showRecordingDialog}
        onOpenChange={setShowRecordingDialog}
        onSave={handleSaveAudio}
      />
    </>
  );
};
