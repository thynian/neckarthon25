import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  FileText,
  Mic,
  Upload,
  X,
  FileAudio,
  MessageSquare,
} from "lucide-react";
import {
  Client,
  Case,
  Documentation,
  AudioFile,
  Attachment,
} from "@/types";
import { generateCaseId, generateId } from "@/utils/idGenerator";

const formSchema = z.object({
  clientId: z.string().min(1, "Client auswählen oder anlegen"),
  caseId: z.string().min(1, "Fall auswählen oder anlegen"),
  title: z.string().min(1, "Titel ist erforderlich").max(200),
  date: z.string().min(1, "Termin ist erforderlich"),
  todos: z.string().optional(),
});

interface NewDocumentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  audioFiles: AudioFile[];
  onSave: (documentation: Documentation) => void;
}

export const NewDocumentationDialog = ({
  open,
  onOpenChange,
  clients,
  setClients,
  cases,
  setCases,
  audioFiles,
  onSave,
}: NewDocumentationDialogProps) => {
  const [newClientName, setNewClientName] = useState("");
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [previewCaseId, setPreviewCaseId] = useState<string>("");
  const [selectedAudioIds, setSelectedAudioIds] = useState<Set<string>>(
    new Set()
  );
  const [audioTranscripts, setAudioTranscripts] = useState<Map<string, string>>(
    new Map()
  );
  const [audioSummaries, setAudioSummaries] = useState<Map<string, string>>(
    new Map()
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      caseId: "",
      title: "",
      date: "",
      todos: "",
    },
  });

  // Generiere Preview Case-ID wenn neuer Fall erstellt wird
  useEffect(() => {
    if (showNewCase) {
      setPreviewCaseId(generateCaseId(cases));
    }
  }, [showNewCase, cases]);

  // Filtere Cases basierend auf ausgewähltem Client
  const filteredCases = selectedClientId
    ? cases.filter((c) => c.clientId === selectedClientId)
    : [];

  const handleCreateClient = () => {
    if (!newClientName.trim()) return;

    const newClient: Client = {
      id: generateId("client-"),
      name: newClientName.trim(),
      createdAt: new Date().toISOString(),
    };

    setClients((prev) => [...prev, newClient]);
    form.setValue("clientId", newClient.id);
    setSelectedClientId(newClient.id);
    setNewClientName("");
    setShowNewClient(false);
    
    toast.success(`Client "${newClient.name}" wurde erstellt`);
  };

  const handleCreateCase = () => {
    if (!newCaseTitle.trim() || !selectedClientId) return;

    const caseId = generateCaseId(cases);
    const newCase: Case = {
      id: generateId("case-"),
      caseId,
      clientId: selectedClientId,
      title: newCaseTitle.trim(),
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    setCases((prev) => [...prev, newCase]);
    form.setValue("caseId", newCase.id);
    setSelectedCaseId(newCase.id);
    setNewCaseTitle("");
    setShowNewCase(false);
    setPreviewCaseId("");
    
    toast.success(`Fall "${caseId}" wurde erstellt`);
  };

  const toggleAudioSelection = (audioId: string) => {
    const newSet = new Set(selectedAudioIds);
    if (newSet.has(audioId)) {
      newSet.delete(audioId);
      // Remove transcript and summary if unselected
      const newTranscripts = new Map(audioTranscripts);
      const newSummaries = new Map(audioSummaries);
      newTranscripts.delete(audioId);
      newSummaries.delete(audioId);
      setAudioTranscripts(newTranscripts);
      setAudioSummaries(newSummaries);
    } else {
      newSet.add(audioId);
    }
    setSelectedAudioIds(newSet);
  };

  const handleTranscribe = (audioId: string) => {
    const newTranscripts = new Map(audioTranscripts);
    newTranscripts.set(
      audioId,
      "Beispiel-Transkript (Mock): Dies ist ein automatisch generiertes Transkript der Audioaufnahme. In einer echten Implementierung würde hier der transkribierte Text der Aufnahme erscheinen."
    );
    setAudioTranscripts(newTranscripts);
  };

  const handleSummarize = (audioId: string) => {
    const newSummaries = new Map(audioSummaries);
    newSummaries.set(
      audioId,
      "Beispiel-Zusammenfassung (Mock): Kurze Zusammenfassung der wichtigsten Punkte aus der Audioaufnahme. Hauptthemen wurden identifiziert und strukturiert."
    );
    setAudioSummaries(newSummaries);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: generateId("att-"),
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      blobUrl: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === attachmentId);
      if (attachment) {
        URL.revokeObjectURL(attachment.blobUrl);
      }
      return prev.filter((a) => a.id !== attachmentId);
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Sammle ausgewählte AudioFiles
    const selectedAudios = audioFiles.filter((audio) =>
      selectedAudioIds.has(audio.id)
    );

    // Erstelle kombinierte Transkripte und Zusammenfassungen
    const allSummaries = Array.from(audioSummaries.values()).join("\n\n");

    // Füge Transkripte zu den jeweiligen AudioFiles hinzu
    const audioFilesWithTranscripts = selectedAudios.map((audio) => ({
      ...audio,
      transcriptText: audioTranscripts.get(audio.id),
    }));

    const newDocumentation: Documentation = {
      id: generateId("doc-"),
      caseId: values.caseId,
      title: values.title,
      date: values.date,
      audioFiles: audioFilesWithTranscripts,
      attachments: attachments,
      todos: values.todos || "",
      summaryText: allSummaries || undefined,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    onSave(newDocumentation);
    toast.success(`Dokumentation "${values.title}" wurde erstellt`);
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    setNewClientName("");
    setNewCaseTitle("");
    setShowNewClient(false);
    setShowNewCase(false);
    setSelectedClientId("");
    setSelectedCaseId("");
    setPreviewCaseId("");
    setSelectedAudioIds(new Set());
    setAudioTranscripts(new Map());
    setAudioSummaries(new Map());
    
    // Cleanup blob URLs
    attachments.forEach((att) => URL.revokeObjectURL(att.blobUrl));
    setAttachments([]);
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Neue Dokumentation</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Dokumentation für einen Fall
              </DialogDescription>
            </div>
            {(showNewCase || previewCaseId) && (
              <Badge variant="outline" className="text-lg">
                {previewCaseId}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Auswahl/Erstellung */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedClientId(value);
                          setSelectedCaseId("");
                          form.setValue("caseId", "");
                        }}
                        value={field.value}
                        disabled={showNewClient}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Client auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowNewClient(!showNewClient)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showNewClient && (
                <div className="flex gap-2 pl-4 border-l-2 border-primary">
                  <Input
                    placeholder="Name des neuen Clients"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                  <Button type="button" onClick={handleCreateClient}>
                    Anlegen
                  </Button>
                </div>
              )}
            </div>

            {/* Case Auswahl/Erstellung */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="caseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fall *</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCaseId(value);
                        }}
                        value={field.value}
                        disabled={!selectedClientId || showNewCase}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Fall auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCases.map((caseItem) => (
                            <SelectItem key={caseItem.id} value={caseItem.id}>
                              {caseItem.caseId} - {caseItem.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowNewCase(!showNewCase)}
                        disabled={!selectedClientId}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showNewCase && (
                <div className="flex gap-2 pl-4 border-l-2 border-primary">
                  <Input
                    placeholder="Titel des neuen Falls"
                    value={newCaseTitle}
                    onChange={(e) => setNewCaseTitle(e.target.value)}
                  />
                  <Button type="button" onClick={handleCreateCase}>
                    Anlegen
                  </Button>
                </div>
              )}
            </div>

            {/* Titel */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel der Dokumentation *</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Erstes Treffen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Termin */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termin *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Audio-Dateien */}
            {audioFiles.length > 0 && (
              <div className="space-y-3">
                <Label>Audiodateien auswählen</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg border border-border p-3">
                  {audioFiles.map((audio) => {
                    const isSelected = selectedAudioIds.has(audio.id);
                    return (
                      <div key={audio.id} className="space-y-2">
                        <div className="flex items-start gap-3 p-2 rounded hover:bg-accent">
                          <Checkbox
                            id={`audio-${audio.id}`}
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleAudioSelection(audio.id)
                            }
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`audio-${audio.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {audio.fileName}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {Math.floor(audio.durationMs / 60000)} min
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleTranscribe(audio.id)}
                              >
                                <FileAudio className="h-3 w-3 mr-1" />
                                Transkribieren
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleSummarize(audio.id)}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Zusammenfassen
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Show transcript/summary if generated */}
                        {isSelected && audioTranscripts.has(audio.id) && (
                          <Alert className="ml-8">
                            <FileAudio className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {audioTranscripts.get(audio.id)}
                            </AlertDescription>
                          </Alert>
                        )}
                        {isSelected && audioSummaries.has(audio.id) && (
                          <Alert className="ml-8">
                            <MessageSquare className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {audioSummaries.get(audio.id)}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Datei-Anhänge */}
            <div className="space-y-3">
              <Label>Datei-Anhänge</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 rounded bg-secondary"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{att.fileName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(att.size / 1024)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(att.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ToDos */}
            <FormField
              control={form.control}
              name="todos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ToDos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ein ToDo pro Zeile&#10;- Budget prüfen&#10;- Team zusammenstellen"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Ein ToDo pro Zeile
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
