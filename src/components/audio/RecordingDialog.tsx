import { AudioFile } from "@/types";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, Pause, Play, Square, Save, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface RecordingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (audioFile: AudioFile) => void;
}

export const RecordingDialog = ({
  open,
  onOpenChange,
  onSave,
}: RecordingDialogProps) => {
  const {
    recordingState,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    formatTime,
  } = useAudioRecorder();

  const [fileName, setFileName] = useState("");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Generate blob URL when recording is stopped
  useEffect(() => {
    if (audioBlob && recordingState === "stopped") {
      const url = URL.createObjectURL(audioBlob);
      setBlobUrl(url);
      
      // Auto-generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      setFileName(`aufnahme_${timestamp}.mp3`);
    }
  }, [audioBlob, recordingState]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleSave = () => {
    if (!audioBlob || !blobUrl) return;

    const audioFile: AudioFile = {
      id: `audio-${Date.now()}`,
      fileName: fileName || `aufnahme_${Date.now()}.mp3`,
      createdAt: new Date().toISOString(),
      durationMs: recordingTime * 1000,
      blobUrl,
    };

    onSave(audioFile);
    handleClose();
  };

  const handleClose = () => {
    resetRecording();
    setFileName("");
    setBlobUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Audio-Aufnahme</DialogTitle>
          <DialogDescription>
            {recordingState === "idle" && "Klicken Sie auf Start, um die Aufnahme zu beginnen"}
            {recordingState === "recording" && "Aufnahme läuft..."}
            {recordingState === "paused" && "Aufnahme pausiert"}
            {recordingState === "stopped" && "Aufnahme beendet"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Recording Status */}
          {recordingState !== "idle" && (
            <div className="flex items-center justify-center space-x-4 rounded-lg bg-secondary p-6">
              <div className="flex items-center space-x-2">
                {recordingState === "recording" && (
                  <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                )}
                {recordingState === "paused" && (
                  <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                )}
                {recordingState === "stopped" && (
                  <Square className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-2xl font-mono font-bold">
                  {formatTime(recordingTime)}
                </span>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          {recordingState === "idle" && (
            <div className="flex justify-center">
              <Button size="lg" onClick={startRecording}>
                <Mic className="mr-2 h-5 w-5" />
                Aufnahme starten
              </Button>
            </div>
          )}

          {(recordingState === "recording" || recordingState === "paused") && (
            <div className="flex justify-center space-x-2">
              {recordingState === "recording" ? (
                <Button variant="secondary" onClick={pauseRecording}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausieren
                </Button>
              ) : (
                <Button variant="secondary" onClick={resumeRecording}>
                  <Play className="mr-2 h-4 w-4" />
                  Fortsetzen
                </Button>
              )}
              <Button variant="destructive" onClick={stopRecording}>
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>
          )}

          {/* Preview & Save */}
          {recordingState === "stopped" && blobUrl && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fileName">Dateiname</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="aufnahme.webm"
                />
              </div>

              <div className="space-y-2">
                <Label>Vorschau</Label>
                <audio controls src={blobUrl} className="w-full" />
              </div>
            </>
          )}
        </div>

        {recordingState === "stopped" && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={!audioBlob}>
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
