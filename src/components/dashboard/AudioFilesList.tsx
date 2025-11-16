import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, FileText, Trash2 } from "lucide-react";
import { useAudioFiles } from "@/hooks/useAudioFiles";
import { supabase } from "@/integrations/supabase/client";
import { transcribeAudioFile } from "@/utils/transcription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AudioFilesList = () => {
  const { audioFiles, isLoading, removeAudioFile } = useAudioFiles();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [transcribingAudioId, setTranscribingAudioId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState<{ id: string; filePath: string; fileName: string } | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  // Generate public URLs for audio files
  const audioFilesWithUrls = audioFiles.map((audio) => {
    const { data } = supabase.storage
      .from("audio-files")
      .getPublicUrl(audio.file_path);
    
    return {
      id: audio.id,
      fileName: audio.file_name,
      createdAt: audio.created_at,
      durationMs: audio.duration_ms || 0,
      blobUrl: data.publicUrl,
    };
  });

  const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")} min`;
  };

  const handlePlayAudio = (audioId: string) => {
    const audioElement = audioRefs.current.get(audioId);
    if (!audioElement) {
      console.error('Audio element not found for id:', audioId);
      return;
    }

    if (playingAudioId === audioId) {
      audioElement.pause();
      setPlayingAudioId(null);
    } else {
      audioRefs.current.forEach((audio, id) => {
        if (id !== audioId) {
          audio.pause();
        }
      });
      
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingAudioId(audioId);
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            setPlayingAudioId(null);
          });
      }
    }
  };

  const handleTranscribe = async (audioId: string, filePath: string) => {
    setTranscribingAudioId(audioId);
    try {
      await transcribeAudioFile(audioId, filePath);
    } finally {
      setTranscribingAudioId(null);
    }
  };

  const handleDeleteClick = (audioId: string, filePath: string, fileName: string) => {
    setAudioToDelete({ id: audioId, filePath, fileName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!audioToDelete) return;
    
    try {
      await removeAudioFile({ id: audioToDelete.id, filePath: audioToDelete.filePath });
      setDeleteDialogOpen(false);
      setAudioToDelete(null);
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Meine Audiodateien</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8 text-sm">
            Laden...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Meine Audiodateien</CardTitle>
      </CardHeader>
      <CardContent>
        {audioFilesWithUrls.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Keine Audiodateien vorhanden
          </p>
        ) : (
          <div className="space-y-2">
            {audioFilesWithUrls.map((audio) => (
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
                </div>
                <div className="mt-1">
                  <audio 
                    ref={(el) => {
                      if (el) {
                        audioRefs.current.set(audio.id, el);
                      }
                    }}
                    controls 
                    src={audio.blobUrl} 
                    className="w-full h-8"
                    preload="metadata"
                    onPlay={() => setPlayingAudioId(audio.id)}
                    onPause={() => setPlayingAudioId(null)}
                    onEnded={() => setPlayingAudioId(null)}
                    onError={(e) => {
                      console.error('Audio error for', audio.fileName, ':', e);
                      console.error('Audio URL:', audio.blobUrl);
                    }}
                    onLoadedMetadata={(e) => {
                      console.log('Audio metadata loaded for', audio.fileName);
                    }}
                  />
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePlayAudio(audio.id)}
                    className="h-7 px-2 text-xs"
                  >
                    {playingAudioId === audio.id ? (
                      <>
                        <Pause className="mr-1 h-3 w-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const audioFile = audioFiles.find(af => af.id === audio.id);
                      if (audioFile) {
                        handleTranscribe(audio.id, audioFile.file_path);
                      }
                    }}
                    disabled={transcribingAudioId === audio.id}
                    className="h-7 px-2 text-xs"
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    {transcribingAudioId === audio.id ? "Transkribiere..." : "Protokoll"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const audioFile = audioFiles.find(af => af.id === audio.id);
                      if (audioFile) {
                        handleDeleteClick(audio.id, audioFile.file_path, audio.fileName);
                      }
                    }}
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Audiodatei löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Datei "{audioToDelete?.fileName}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
