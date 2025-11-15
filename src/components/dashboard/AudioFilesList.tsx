import { Documentation, AudioFile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";

interface AudioFilesListProps {
  documentations: Documentation[];
}

export const AudioFilesList = ({ documentations }: AudioFilesListProps) => {
  // Sammle alle Audio-Dateien aus allen Dokumentationen
  const allAudioFiles: (AudioFile & { docTitle: string })[] = [];
  
  documentations.forEach((doc) => {
    doc.audioFiles.forEach((audio) => {
      allAudioFiles.push({
        ...audio,
        docTitle: doc.title,
      });
    });
  });

  const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")} min`;
  };

  const handlePlayAudio = (audioId: string) => {
    console.log("Abspielen Audio:", audioId);
  };

  const handleAddToDocumentation = (audioId: string) => {
    console.log("Zu Dokumentation hinzufügen:", audioId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meine Audiodateien</CardTitle>
      </CardHeader>
      <CardContent>
        {allAudioFiles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Keine Audiodateien vorhanden
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Dateiname
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Dokumentation
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Dauer
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Datum
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {allAudioFiles.map((audio) => (
                  <tr key={audio.id} className="border-b border-border/50">
                    <td className="py-4 text-sm font-medium text-foreground">
                      {audio.fileName}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {audio.docTitle}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {formatDuration(audio.durationMs)}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {new Date(audio.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePlayAudio(audio.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Abspielen
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddToDocumentation(audio.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Hinzufügen
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
