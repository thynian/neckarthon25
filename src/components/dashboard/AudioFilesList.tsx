import { useState } from "react";
import { Documentation, AudioFile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Pause } from "lucide-react";

interface AudioFilesListProps {
  documentations: Documentation[];
  audioFiles: AudioFile[];
}

export const AudioFilesList = ({ documentations, audioFiles }: AudioFilesListProps) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  // Sammle alle Audio-Dateien aus Dokumentationen
  const allAudioFiles: (AudioFile & { docTitle?: string })[] = [];
  
  documentations.forEach((doc) => {
    doc.audioFiles.forEach((audio) => {
      allAudioFiles.push({
        ...audio,
        docTitle: doc.title,
      });
    });
  });

  // Füge eigenständige Audio-Dateien hinzu
  audioFiles.forEach((audio) => {
    allAudioFiles.push({
      ...audio,
      docTitle: undefined,
    });
  });

  const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")} min`;
  };

  const handlePlayAudio = (audioId: string, blobUrl: string) => {
    if (playingAudioId === audioId) {
      // Stop playing
      setPlayingAudioId(null);
    } else {
      // Start playing
      setPlayingAudioId(audioId);
      
      // Create audio element and play
      const audio = new Audio(blobUrl);
      audio.play();
      
      audio.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  const handleAddToDocumentation = (audioId: string) => {
    console.log("Zu Dokumentation hinzufügen:", audioId);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Meine Audiodateien</CardTitle>
      </CardHeader>
      <CardContent>
        {allAudioFiles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Keine Audiodateien vorhanden
          </p>
        ) : (
          <div className="space-y-2">
            {allAudioFiles.map((audio) => (
              <div
                key={audio.id}
                className="border border-border rounded-lg p-2 sm:p-3 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">
                    {audio.fileName}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDuration(audio.durationMs)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(audio.createdAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {audio.docTitle && ` · ${audio.docTitle}`}
                </div>
                <div className="mt-1">
                  <audio controls src={audio.blobUrl} className="w-full h-8" />
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePlayAudio(audio.id, audio.blobUrl)}
                    className="text-xs px-2 py-1"
                  >
                    {playingAudioId === audio.id ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Abspielen
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddToDocumentation(audio.id)}
                    className="text-xs px-2 py-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Zu Dokumentation hinzufügen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
