import { useState } from "react";
import { Documentation, Case, Client, AudioFile, Attachment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Play, Pause, Trash2, Plus, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/utils/idGenerator";
import { DocumentationStatusBadge } from "./DocumentationStatusBadge";

interface DocumentationDetailProps {
  documentation: Documentation;
  clients: Client[];
  cases: Case[];
  audioFiles: AudioFile[];
  onBack: () => void;
  onSave: (updatedDoc: Documentation) => void;
}

export const DocumentationDetail = ({
  documentation,
  clients,
  cases,
  audioFiles,
  onBack,
  onSave,
}: DocumentationDetailProps) => {
  const [editedDoc, setEditedDoc] = useState<Documentation>(documentation);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isAddAudioOpen, setIsAddAudioOpen] = useState(false);

  const currentCase = cases.find((c) => c.id === editedDoc.caseId);
  const currentClient = clients.find((cl) => cl.id === currentCase?.clientId);
  
  const availableCases = cases.filter((c) => c.clientId === currentClient?.id);
  const availableAudioFiles = audioFiles.filter(
    (af) => !editedDoc.audioFiles.some((docAf) => docAf.id === af.id)
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

  const handleAddAudio = (audioFile: AudioFile) => {
    setEditedDoc({
      ...editedDoc,
      audioFiles: [...editedDoc.audioFiles, audioFile],
    });
    setIsAddAudioOpen(false);
    toast.success("Audiodatei hinzugefügt");
  };

  const handleTranscribe = () => {
    const newTranscript = "Dies ist ein Beispiel-Transkript (Mock). In der echten Implementierung würde hier der transkribierte Text der Audiodateien erscheinen.";
    setEditedDoc({
      ...editedDoc,
      transcriptText: editedDoc.transcriptText 
        ? `${editedDoc.transcriptText}\n\n---\n\n${newTranscript}`
        : newTranscript,
      status: editedDoc.status === "OPEN" ? "IN_REVIEW" : editedDoc.status,
    });
    toast.success("Transkription erstellt (Mock)");
  };

  const handleSummarize = () => {
    const newSummary = "Dies ist eine Beispiel-Zusammenfassung (Mock). In der echten Implementierung würde hier eine KI-generierte Zusammenfassung erscheinen.";
    setEditedDoc({
      ...editedDoc,
      summaryText: editedDoc.summaryText 
        ? `${editedDoc.summaryText}\n\n---\n\n${newSummary}`
        : newSummary,
    });
    toast.success("Zusammenfassung erstellt (Mock)");
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
    toast.success("Dokumentation als überprüft markiert");
  };

  const handleMarkAsInReview = () => {
    setEditedDoc({
      ...editedDoc,
      status: "IN_REVIEW",
    });
    toast.success("Dokumentation zurück in Überprüfung gesetzt");
  };

  const handleSave = () => {
    onSave(editedDoc);
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
              Als überprüft markieren
            </Button>
          )}
          {editedDoc.status === "VERIFIED" && (
            <Button size="sm" variant="outline" onClick={handleMarkAsInReview}>
              Zurück in Überprüfung
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
              onChange={(e) => setEditedDoc({ ...editedDoc, title: e.target.value })}
              placeholder="Titel der Dokumentation"
            />
          </div>

          <div>
            <Label htmlFor="client">Client</Label>
            <Select
              value={currentClient?.id}
              onValueChange={handleClientChange}
            >
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
              onValueChange={(caseId) => setEditedDoc({ ...editedDoc, caseId })}
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
              onChange={(e) => setEditedDoc({ ...editedDoc, date: new Date(e.target.value).toISOString() })}
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
                      <p className="text-center text-muted-foreground py-8">
                        Keine weiteren Audio-Dateien verfügbar
                      </p>
                    ) : (
                      availableAudioFiles.map((af) => (
                        <div key={af.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                          <div>
                            <p className="font-medium text-sm">{af.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDuration(af.durationMs)}
                            </p>
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
              <Button size="sm" variant="outline" onClick={handleTranscribe}>
                Transkribieren (Mock)
              </Button>
              <Button size="sm" variant="outline" onClick={handleSummarize}>
                Zusammenfassen (Mock)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editedDoc.audioFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Audio-Dateien vorhanden
            </p>
          ) : (
            editedDoc.audioFiles.map((audioFile) => (
              <div key={audioFile.id} className="flex items-center gap-4 p-4 border border-border rounded-md">
                <div className="flex-1">
                  <p className="font-medium">{audioFile.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    Dauer: {formatDuration(audioFile.durationMs)}
                  </p>
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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveAudio(audioFile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {editedDoc.transcriptText && (
            <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
              <Label htmlFor="transcript">Transkript</Label>
              <Textarea
                id="transcript"
                value={editedDoc.transcriptText}
                onChange={(e) => setEditedDoc({ ...editedDoc, transcriptText: e.target.value })}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          )}

          {editedDoc.summaryText && (
            <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
              <Label htmlFor="summary">Zusammenfassung</Label>
              <Textarea
                id="summary"
                value={editedDoc.summaryText}
                onChange={(e) => setEditedDoc({ ...editedDoc, summaryText: e.target.value })}
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
            <p className="text-center text-muted-foreground py-8">
              Keine Anhänge vorhanden
            </p>
          ) : (
            <div className="space-y-2">
              {editedDoc.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 border border-border rounded-md">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                    >
                      <a href={attachment.blobUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
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
            onChange={(e) => setEditedDoc({ ...editedDoc, todos: e.target.value })}
            placeholder="Ein ToDo pro Zeile..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Tipp: Schreiben Sie jedes ToDo in eine neue Zeile
          </p>
        </CardContent>
      </Card>

      {/* Aktionen */}
      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={onBack}>
          Abbrechen
        </Button>
        <Button onClick={handleSave}>
          Änderungen speichern
        </Button>
      </div>
    </div>
  );
};
