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
  onSaveAndCreateDocumentation?: (audioFile: AudioFile) => void;
}

export const RecordingDialog = ({
  open,
  onOpenChange,
  onSave,
  onSaveAndCreateDocumentation,
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

  const handleSave = (createDocumentation: boolean = false) => {
    if (!audioBlob || !blobUrl) return;

    const audioFile: AudioFile = {
      id: `audio-${Date.now()}`,
      fileName: fileName || `aufnahme_${Date.now()}.mp3`,
      createdAt: new Date().toISOString(),
      durationMs: recordingTime * 1000,
      blobUrl,
      blob: audioBlob, // Speichere das Blob für späteren Upload
    };

    if (createDocumentation && onSaveAndCreateDocumentation) {
      onSaveAndCreateDocumentation(audioFile);
    } else {
      onSave(audioFile);
    }
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
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Audio-Aufnahme</DialogTitle>
          <DialogDescription className="text-sm">
            {recordingState === "idle" && "Klicken Sie auf Start, um die Aufnahme zu beginnen"}
            {recordingState === "recording" && "Aufnahme läuft..."}
            {recordingState === "paused" && "Aufnahme pausiert"}
            {recordingState === "stopped" && "Aufnahme beendet"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4 min-w-0 overflow-hidden">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Recording Status */}
          {recordingState !== "idle" && (
            <div className="flex items-center justify-center rounded-lg bg-secondary p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                {recordingState === "recording" && (
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive animate-pulse" />
                )}
                {recordingState === "paused" && (
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-muted-foreground" />
                )}
                {recordingState === "stopped" && (
                  <Square className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                )}
                <span className="text-xl sm:text-2xl font-mono font-bold">
                  {formatTime(recordingTime)}
                </span>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          {recordingState === "idle" && (
            <div className="flex justify-center">
              <Button size="lg" onClick={startRecording} className="w-full sm:w-auto">
                <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Aufnahme starten
              </Button>
            </div>
          )}

          {(recordingState === "recording" || recordingState === "paused") && (
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              {recordingState === "recording" ? (
                <Button variant="secondary" onClick={pauseRecording} className="w-full sm:w-auto">
                  <Pause className="mr-2 h-4 w-4" />
                  Pausieren
                </Button>
              ) : (
                <Button variant="secondary" onClick={resumeRecording} className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Fortsetzen
                </Button>
              )}
              <Button variant="destructive" onClick={stopRecording} className="w-full sm:w-auto">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>
          )}

          {/* Preview & Save */}
          {recordingState === "stopped" && blobUrl && (
            <>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="fileName" className="text-sm">Dateiname</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="aufnahme.webm"
                  className="text-sm w-full min-w-0"
                />
              </div>

              <div className="space-y-2 min-w-0">
                <Label className="text-sm">Vorschau</Label>
                <audio controls src={blobUrl} className="w-full min-w-0 max-w-full h-10 sm:h-12" />
              </div>
            </>
          )}
        </div>

        {recordingState === "stopped" && (
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto order-last sm:order-first">
              Abbrechen
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={!audioBlob} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Nur Speichern
            </Button>
            {onSaveAndCreateDocumentation && (
              <Button onClick={() => handleSave(true)} disabled={!audioBlob} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                Dokumentation starten
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
