import { useState } from "react";
import { Documentation, Case, Client, AudioFile, Attachment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Play, Pause, Trash2, Plus, FileText, Download, X, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/utils/idGenerator";
import { DocumentationStatusBadge } from "./DocumentationStatusBadge";
import { useAudioFiles } from "@/hooks/useAudioFiles";
import { supabase } from "@/integrations/supabase/client";
import { transcribeAudioFile } from "@/utils/transcription";
interface DocumentationDetailProps {
  documentation: Documentation;
  clients: Client[];
  cases: Case[];
  audioFiles: AudioFile[];
  onBack: () => void;
  onSave: (updatedDoc: Documentation) => void;
  onDelete?: (docId: string) => void;
}
export const DocumentationDetail = ({
  documentation,
  clients,
  cases,
  audioFiles,
  onBack,
  onSave,
  onDelete,
}: DocumentationDetailProps) => {
  const [editedDoc, setEditedDoc] = useState<Documentation>(documentation);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [transcribingAudioId, setTranscribingAudioId] = useState<string | null>(null);
  const [isAddAudioOpen, setIsAddAudioOpen] = useState(false);
  const [isCuratingTopics, setIsCuratingTopics] = useState(false);
  const [curatedTopics, setCuratedTopics] = useState<string[]>(documentation.curatedTopics || []);
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);
  const [editingTopicText, setEditingTopicText] = useState("");

  // Lade gespeicherte Audio-Dateien aus der Datenbank
  const { audioFiles: savedAudioFiles, isLoading: isLoadingAudio } = useAudioFiles();

  const currentCase = cases.find((c) => c.id === editedDoc.caseId);
  const currentClient = clients.find((cl) => cl.id === currentCase?.clientId);
  const availableCases = cases.filter((c) => c.clientId === currentClient?.id);

  // Kombiniere Audio-Dateien: bereits zugeordnete + gespeicherte ohne documentation_id
  const savedAudioFormatted: AudioFile[] = (savedAudioFiles || [])
    .filter((af) => !af.documentation_id)
    .map((af) => {
      // Generiere die vollständige öffentliche URL von Supabase Storage
      const { data } = supabase.storage
        .from("audio-files")
        .getPublicUrl(af.file_path);
      
      return {
        id: af.id,
        fileName: af.file_name,
        createdAt: af.created_at,
        durationMs: af.duration_ms || 0,
        blobUrl: data.publicUrl, // Verwende die vollständige öffentliche URL
        transcriptText: af.transcript_text || undefined,
      };
    });

  // Verfügbare Audio-Dateien: alle aus Props + gespeicherte, aber nicht die bereits zugeordneten
  const allAvailableAudio = [...audioFiles, ...savedAudioFormatted];
  const availableAudioFiles = allAvailableAudio.filter(
    (af) => !editedDoc.audioFiles.some((docAf) => docAf.id === af.id),
  );
  const handlePlayAudio = (audioId: string, blobUrl: string) => {
    const audio = document.getElementById(`audio-${audioId}`) as HTMLAudioElement;
    if (playingAudioId === audioId) {
      audio?.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId) {
        const prevAudio = document.getElementById(`audio-${playingAudioId}`) as HTMLAudioElement;
        prevAudio?.pause();
      }
      audio?.play();
      setPlayingAudioId(audioId);
    }
  };
  const handleRemoveAudio = (audioId: string) => {
    setEditedDoc({
      ...editedDoc,
      audioFiles: editedDoc.audioFiles.filter((af) => af.id !== audioId),
    });
    toast.success("Audiodatei entfernt");
  };
  const handleUpdateTranscript = (audioId: string, newTranscript: string) => {
    setEditedDoc({
      ...editedDoc,
      audioFiles: editedDoc.audioFiles.map((af) =>
        af.id === audioId
          ? {
              ...af,
              transcriptText: newTranscript,
            }
          : af,
      ),
    });
  };
  const handleAddAudio = (audioFile: AudioFile) => {
    setEditedDoc({
      ...editedDoc,
      audioFiles: [...editedDoc.audioFiles, audioFile],
    });
    setIsAddAudioOpen(false);
    toast.success("Audiodatei hinzugefügt");
  };
  const handleTranscribe = async (audioId: string) => {
    // Finde die Audio-Datei in den gespeicherten Dateien, um den file_path zu erhalten
    const audioFileData = savedAudioFiles?.find(af => af.id === audioId);
    
    if (!audioFileData) {
      toast.error("Audiodatei nicht gefunden");
      return;
    }

    setTranscribingAudioId(audioId);
    
    try {
      const transcript = await transcribeAudioFile(audioId, audioFileData.file_path);
      
      // Update the editedDoc with the transcript
      setEditedDoc({
        ...editedDoc,
        audioFiles: editedDoc.audioFiles.map((af) =>
          af.id === audioId
            ? {
                ...af,
                transcriptText: transcript,
              }
            : af,
        ),
        status: editedDoc.status === "OPEN" ? "IN_REVIEW" : editedDoc.status,
      });
    } finally {
      setTranscribingAudioId(null);
    }
  };
  const handleStartCuration = () => {
    const dummyTopics = [
      "Cybermobbing in der Klasse und online:\nBeleidigende Nachrichten über WhatsApp und Instagram, Ausschluss aus der Klassengemeinschaft, emotionale Belastung.\nSammlung von Beispielen, Verständnis der Situation und erste Schutzmaßnahmen (Blockieren, Melden).",
      "Schulische Probleme und Missverständnisse:\nVerpasste Klassenarbeit durch Fehlinformationen von Mitschülern.\nÜberlegungen, wie verpasste Aufgaben nachgeholt werden können, Absprache mit Lehrkraft und Eltern.",
      "Strategien und Problemlösungen:\nKonkrete Handlungsschritte für den Schüler: Dokumentation, sachliche Kommunikation mit Lehrern, Umgang mit Beleidigungen.\nSoziale Strategien, wie Kontakte zu neutralen Mitschülern oder Unterstützung außerhalb der Klasse stärken.",
      "Familiäre Situation und Unterstützung zuhause:\nSpannungen zwischen den Eltern, Rückzugsorte und feste Gesprächszeiten.\nEinbindung der Eltern in schulische Angelegenheiten zur Unterstützung",
      "Selbststärkung und Planung für die Zukunft:\nAufbau von Selbstbewusstsein, Aktivitäten außerhalb der Schule (z. B. Fußball).\nFestlegung von konkreten Aufgaben bis zum nächsten Gespräch (zwei für den Schüler, eine für den Sozialarbeiter) und Erstellung eines klaren Handlungsplans",
    ];
    setCuratedTopics(dummyTopics);
    setIsCuratingTopics(true);
    toast.success("Themen aus Transkript vorgeschlagen");
  };

  const handleAddTopic = () => {
    setCuratedTopics([...curatedTopics, "Neues Thema"]);
    toast.success("Thema hinzugefügt");
  };

  const handleDeleteTopic = (index: number) => {
    setCuratedTopics(curatedTopics.filter((_, i) => i !== index));
    toast.success("Thema entfernt");
  };

  const handleStartEditTopic = (index: number) => {
    setEditingTopicIndex(index);
    setEditingTopicText(curatedTopics[index]);
  };

  const handleSaveEditTopic = () => {
    if (editingTopicIndex !== null) {
      const updatedTopics = [...curatedTopics];
      updatedTopics[editingTopicIndex] = editingTopicText;
      setCuratedTopics(updatedTopics);
      setEditingTopicIndex(null);
      setEditingTopicText("");
      toast.success("Thema aktualisiert");
    }
  };

  const handleCancelEditTopic = () => {
    setEditingTopicIndex(null);
    setEditingTopicText("");
  };

  const handleFinalizeSummary = async () => {
    try {
      toast.loading("Generiere Zusammenfassung...", { id: "summary-generation" });

      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { topics: curatedTopics },
      });

      if (error) {
        console.error("Error generating summary:", error);
        toast.error("Fehler beim Generieren der Zusammenfassung", { id: "summary-generation" });
        return;
      }

      if (!data?.summary) {
        toast.error("Keine Zusammenfassung erhalten", { id: "summary-generation" });
        return;
      }

      const updatedDoc = {
        ...editedDoc,
        summaryText: data.summary,
        curatedTopics: curatedTopics,
      };

      setEditedDoc(updatedDoc);
      onSave(updatedDoc);
      setIsCuratingTopics(false);
      toast.success("Zusammenfassung erstellt und gespeichert", { id: "summary-generation" });
    } catch (error) {
      console.error("Error in handleFinalizeSummary:", error);
      toast.error("Fehler beim Generieren der Zusammenfassung", { id: "summary-generation" });
    }
  };
  const handleRemoveAttachment = (attachmentId: string) => {
    setEditedDoc({
      ...editedDoc,
      attachments: editedDoc.attachments.filter((att) => att.id !== attachmentId),
    });
    toast.success("Anhang entfernt");
  };
  const handleAddAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: generateId("att-"),
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      blobUrl: URL.createObjectURL(file),
    }));
    setEditedDoc({
      ...editedDoc,
      attachments: [...editedDoc.attachments, ...newAttachments],
    });
    toast.success(`${newAttachments.length} Datei(en) hinzugefügt`);
    event.target.value = "";
  };
  const handleClientChange = (clientId: string) => {
    const clientCases = cases.filter((c) => c.clientId === clientId);
    if (clientCases.length > 0) {
      setEditedDoc({
        ...editedDoc,
        caseId: clientCases[0].id,
      });
    }
  };
  const handleMarkAsVerified = () => {
    setEditedDoc({
      ...editedDoc,
      status: "VERIFIED",
    });
    toast.success("Dokumentation als fertig markiert");
  };
  const handleMarkAsInReview = () => {
    setEditedDoc({
      ...editedDoc,
      status: "IN_REVIEW",
    });
    toast.success("Dokumentation zurück in Überprüfung gesetzt");
  };
  const handleDelete = () => {
    if (onDelete && confirm("Möchten Sie diese Dokumentation wirklich löschen?")) {
      onDelete(editedDoc.id);
      toast.success("Dokumentation gelöscht");
      onBack();
    }
  };
  const handleSave = () => {
    const updatedDoc = {
      ...editedDoc,
      curatedTopics: curatedTopics.length > 0 ? curatedTopics : editedDoc.curatedTopics,
    };

    onSave(updatedDoc);
    setEditedDoc(updatedDoc);
    setIsCuratingTopics(false);
    toast.success("Änderungen gespeichert");
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  const formatDuration = (durationMs: number): string => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dokumentation bearbeiten</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fall-ID: <span className="font-mono">{currentCase?.caseId}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DocumentationStatusBadge status={editedDoc.status} />
          {editedDoc.status !== "VERIFIED" && (
            <Button size="sm" onClick={handleMarkAsVerified}>
              Fertig
            </Button>
          )}
          {editedDoc.status === "VERIFIED" && (
            <Button size="sm" variant="outline" onClick={handleMarkAsInReview}>
              Zurück in Überprüfung
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Löschen
            </Button>
          )}
        </div>
      </div>

      {/* Grunddaten */}
      <Card>
        <CardHeader>
          <CardTitle>Grunddaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={editedDoc.title}
              onChange={(e) =>
                setEditedDoc({
                  ...editedDoc,
                  title: e.target.value,
                })
              }
              placeholder="Titel der Dokumentation"
            />
          </div>

          <div>
            <Label htmlFor="client">Client</Label>
            <Select value={currentClient?.id} onValueChange={handleClientChange}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Client auswählen" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="case">Fall</Label>
            <Select
              value={editedDoc.caseId}
              onValueChange={(caseId) =>
                setEditedDoc({
                  ...editedDoc,
                  caseId,
                })
              }
            >
              <SelectTrigger id="case">
                <SelectValue placeholder="Fall auswählen" />
              </SelectTrigger>
              <SelectContent>
                {availableCases.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.caseId} - {caseItem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Termin</Label>
            <Input
              id="date"
              type="datetime-local"
              value={editedDoc.date.slice(0, 16)}
              onChange={(e) =>
                setEditedDoc({
                  ...editedDoc,
                  date: new Date(e.target.value).toISOString(),
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Audio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audio-Dateien</CardTitle>
            <div className="flex gap-2">
              <Dialog open={isAddAudioOpen} onOpenChange={setIsAddAudioOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Audio hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Audio-Datei hinzufügen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableAudioFiles.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Keine weiteren Audio-Dateien verfügbar</p>
                    ) : (
                      availableAudioFiles.map((af) => (
                        <div
                          key={af.id}
                          className="flex items-center justify-between p-3 border border-border rounded-md"
                        >
                          <div>
                            <p className="font-medium text-sm">{af.fileName}</p>
                            <p className="text-xs text-muted-foreground">{formatDuration(af.durationMs)}</p>
                          </div>
                          <Button size="sm" onClick={() => handleAddAudio(af)}>
                            Hinzufügen
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              {editedDoc.audioFiles.length > 0 && curatedTopics.length === 0 && (
                <Button size="sm" variant="outline" onClick={handleStartCuration}>
                  Themen aus Transkript vorschlagen
                </Button>
              )}
              {editedDoc.audioFiles.length > 0 && curatedTopics.length > 0 && !isCuratingTopics && (
                <Button size="sm" variant="outline" onClick={() => setIsCuratingTopics(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Themen bearbeiten
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editedDoc.audioFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Keine Audio-Dateien vorhanden</p>
          ) : (
            editedDoc.audioFiles.map((audioFile) => (
              <div key={audioFile.id} className="space-y-3 p-4 border border-border rounded-md">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{audioFile.fileName}</p>
                    <p className="text-sm text-muted-foreground">Dauer: {formatDuration(audioFile.durationMs)}</p>
                    <audio
                      id={`audio-${audioFile.id}`}
                      src={audioFile.blobUrl}
                      onEnded={() => setPlayingAudioId(null)}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlayAudio(audioFile.id, audioFile.blobUrl)}
                    >
                      {playingAudioId === audioFile.id ? (
                        <Pause className="h-4 w-4 mr-1" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      {playingAudioId === audioFile.id ? "Stop" : "Abspielen"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleTranscribe(audioFile.id)} disabled={transcribingAudioId === audioFile.id}>
                      <FileText className="h-4 w-4 mr-1" />
                      {transcribingAudioId === audioFile.id ? "Transkribiere..." : "Protokoll"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveAudio(audioFile.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {audioFile.transcriptText && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor={`transcript-${audioFile.id}`}>Protokoll</Label>
                    <Textarea
                      id={`transcript-${audioFile.id}`}
                      value={audioFile.transcriptText}
                      onChange={(e) => handleUpdateTranscript(audioFile.id, e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            ))
          )}

          {curatedTopics.length > 0 && isCuratingTopics && (
            <div className="mt-4 p-4 border border-border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Themen kuratieren</Label>
                <Button size="sm" onClick={handleAddTopic}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thema hinzufügen
                </Button>
              </div>

              <div className="space-y-2">
                {curatedTopics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    {editingTopicIndex === index ? (
                      <>
                        <Textarea
                          value={editingTopicText}
                          onChange={(e) => setEditingTopicText(e.target.value)}
                          className="flex-1 min-h-[120px]"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEditTopic}>
                          Speichern
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEditTopic}>
                          Abbrechen
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{topic}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleStartEditTopic(index)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTopic(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleFinalizeSummary} className="w-full">
                Themen speichern
              </Button>
            </div>
          )}

          {editedDoc.summaryText && (
            <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
              <Label htmlFor="summary">Zusammenfassung (über alle Audiodateien)</Label>
              <Textarea
                id="summary"
                value={editedDoc.summaryText}
                onChange={(e) =>
                  setEditedDoc({
                    ...editedDoc,
                    summaryText: e.target.value,
                  })
                }
                rows={6}
                className="text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anhänge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Anhänge</CardTitle>
            <Button size="sm" variant="outline" asChild>
              <label htmlFor="attachment-upload" className="cursor-pointer">
                <Plus className="h-4 w-4 mr-1" />
                Datei anhängen
                <input
                  id="attachment-upload"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx"
                  onChange={handleAddAttachment}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editedDoc.attachments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Keine Anhänge vorhanden</p>
          ) : (
            <div className="space-y-2">
              {editedDoc.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border border-border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.fileType} • {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <a href={attachment.blobUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveAttachment(attachment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ToDos */}
      <Card>
        <CardHeader>
          <CardTitle>ToDos</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedDoc.todos}
            onChange={(e) =>
              setEditedDoc({
                ...editedDoc,
                todos: e.target.value,
              })
            }
            placeholder="Ein ToDo pro Zeile..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-2">Tipp: Schreiben Sie jedes ToDo in eine neue Zeile</p>
        </CardContent>
      </Card>

      {/* Aktionen */}
      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={onBack}>
          Abbrechen
        </Button>
        <Button onClick={handleSave}>Änderungen speichern</Button>
      </div>
    </div>
  );
};
