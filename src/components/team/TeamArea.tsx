import { useState } from "react";
import { Client, Case, Documentation, AudioFile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ChevronRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentationStatusBadge } from "@/components/documentation/DocumentationStatusBadge";
import { DocumentationDetail } from "@/components/documentation/DocumentationDetail";
import { useDocumentations } from "@/hooks/useDocumentations";

interface TeamAreaProps {
  clients: Client[];
  cases: Case[];
  documentations: Documentation[];
  audioFiles: AudioFile[];
}

type TeamLevel = "clients" | "cases" | "docs" | "docDetail";

export const TeamArea = ({ clients, cases, documentations, audioFiles }: TeamAreaProps) => {
  const { updateDocumentation, deleteDocumentation } = useDocumentations();
  const [teamSearch, setTeamSearch] = useState("");
  const [teamActiveTab, setTeamActiveTab] = useState<"clients" | "cases" | "docs">("clients");
  const [teamLevel, setTeamLevel] = useState<TeamLevel>("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [selectedDocumentationId, setSelectedDocumentationId] = useState<string | undefined>();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Helper functions
  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Unbekannt";
  };

  const getCasesForClient = (clientId: string) => {
    return cases.filter((c) => c.clientId === clientId);
  };

  const getDocumentationsForCase = (caseId: string) => {
    return documentations.filter((d) => d.caseId === caseId);
  };

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

  const formatDuration = (durationMs: number): string => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Tab handlers
  const handleTabChange = (value: string) => {
    const tab = value as "clients" | "cases" | "docs";
    setTeamActiveTab(tab);
    setTeamLevel(tab);
    setSelectedClientId(undefined);
    setSelectedCaseId(undefined);
    setSelectedDocumentationId(undefined);
  };

  // Navigation handlers
  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedCaseId(undefined);
    setSelectedDocumentationId(undefined);
    setTeamLevel("cases");
  };

  const handleCaseClick = (caseId: string, clientId?: string) => {
    if (clientId) {
      setSelectedClientId(clientId);
    }
    setSelectedCaseId(caseId);
    setSelectedDocumentationId(undefined);
    setTeamLevel("docs");
  };

  const handleDocumentationClick = (docId: string, caseId?: string) => {
    setEditingDocId(docId);
  };

  const handleUpdateDocumentation = async (updatedDoc: Documentation) => {
    // Map camelCase to snake_case for database
    const updates: any = {};
    if (updatedDoc.title !== undefined) updates.title = updatedDoc.title;
    if (updatedDoc.date !== undefined) updates.date = updatedDoc.date;
    if (updatedDoc.todos !== undefined) updates.todos = updatedDoc.todos;
    if (updatedDoc.status !== undefined) updates.status = updatedDoc.status;
    if ((updatedDoc as any).transcriptText !== undefined) updates.transcript_text = (updatedDoc as any).transcriptText;
    if ((updatedDoc as any).summaryText !== undefined) updates.summary_text = (updatedDoc as any).summaryText;
    
    await updateDocumentation({
      id: updatedDoc.id,
      updates,
      audioFiles: updatedDoc.audioFiles
    });
    
    setEditingDocId(null);
  };

  const handleDeleteDocumentation = async (docId: string) => {
    await deleteDocumentation(docId);
  };

  const handleBreadcrumbClients = () => {
    setTeamLevel("clients");
    setTeamActiveTab("clients");
    setSelectedClientId(undefined);
    setSelectedCaseId(undefined);
    setSelectedDocumentationId(undefined);
  };

  const handleBreadcrumbClient = () => {
    setTeamLevel("cases");
    setSelectedCaseId(undefined);
    setSelectedDocumentationId(undefined);
  };

  const handleBreadcrumbCase = () => {
    setTeamLevel("docs");
    setSelectedDocumentationId(undefined);
  };

  // Sort function
  const sortByDate = <T extends { createdAt: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  };

  // Filter functions
  const filteredClients = sortByDate(
    clients.filter((client) =>
      client.name.toLowerCase().includes(teamSearch.toLowerCase())
    )
  );

  const filteredCases = sortByDate(
    cases.filter((caseItem) => {
      const searchLower = teamSearch.toLowerCase();
      const clientName = getClientName(caseItem.clientId);
      return (
        caseItem.title.toLowerCase().includes(searchLower) ||
        caseItem.caseId.toLowerCase().includes(searchLower) ||
        clientName.toLowerCase().includes(searchLower)
      );
    })
  );

  const filteredDocumentations = sortByDate(
    documentations.filter((doc) => {
      const searchLower = teamSearch.toLowerCase();
      const relatedCase = cases.find((c) => c.id === doc.caseId);
      const clientName = relatedCase ? getClientName(relatedCase.clientId) : "";
      return (
        doc.title.toLowerCase().includes(searchLower) ||
        relatedCase?.title.toLowerCase().includes(searchLower) ||
        relatedCase?.caseId.toLowerCase().includes(searchLower) ||
        clientName.toLowerCase().includes(searchLower)
      );
    })
  );

  // Selected entities
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const selectedDocumentation = documentations.find((d) => d.id === selectedDocumentationId);

  // Edit mode for documentation
  const editingDoc = documentations.find((doc) => doc.id === editingDocId);

  if (editingDoc) {
    return (
      <DocumentationDetail
        documentation={editingDoc}
        clients={clients}
        cases={cases}
        audioFiles={audioFiles}
        onBack={() => setEditingDocId(null)}
        onSave={handleUpdateDocumentation}
        onDelete={handleDeleteDocumentation}
      />
    );
  }

  // Render content based on level
  const renderContent = () => {
    // Client List View
    if (teamLevel === "clients") {
      return (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Klienten ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Keine Klienten gefunden
                </p>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleClientClick(client.id)}
                    className="p-3 border rounded-lg cursor-pointer transition-colors border-border hover:bg-accent/50 min-h-[44px]"
                  >
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Erstellt: {new Date(client.createdAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Case List View (either for selected client or all cases)
    if (teamLevel === "cases") {
      const casesToShow = selectedClient 
        ? sortByDate(
            getCasesForClient(selectedClient.id).filter((caseItem) =>
              caseItem.title.toLowerCase().includes(teamSearch.toLowerCase()) ||
              caseItem.caseId.toLowerCase().includes(teamSearch.toLowerCase())
            )
          )
        : filteredCases;

      const title = selectedClient 
        ? `Fälle von ${selectedClient.name}`
        : "Alle Fälle";

      return (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {casesToShow.length} Fälle gefunden
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2">
              {casesToShow.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Keine Fälle gefunden
                </p>
              ) : (
                casesToShow.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => handleCaseClick(caseItem.id, caseItem.clientId)}
                    className="p-3 border rounded-lg cursor-pointer transition-colors border-border hover:bg-accent/50 min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{caseItem.title}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.caseId}</p>
                        {!selectedClient && (
                          <p className="text-xs text-muted-foreground">
                            Klient: {getClientName(caseItem.clientId)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Erstellt: {new Date(caseItem.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                      <Badge variant={caseItem.status === "OPEN" ? "secondary" : "outline"}>
                        {caseItem.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Documentation List View (either for selected case or all docs)
    if (teamLevel === "docs") {
      const docsToShow = selectedCase
        ? sortByDate(
            getDocumentationsForCase(selectedCase.id).filter((doc) =>
              doc.title.toLowerCase().includes(teamSearch.toLowerCase())
            )
          )
        : filteredDocumentations;

      const title = selectedCase
        ? `Dokumentationen für Fall: ${selectedCase.title}`
        : "Alle Dokumentationen";

      return (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {docsToShow.length} Dokumentationen gefunden
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2">
              {docsToShow.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Keine Dokumentationen gefunden
                </p>
              ) : (
                docsToShow.map((doc) => {
                  const relatedCase = cases.find((c) => c.id === doc.caseId);
                  const clientName = relatedCase ? getClientName(relatedCase.clientId) : "";
                  
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentationClick(doc.id, doc.caseId)}
                      className="p-3 border rounded-lg cursor-pointer transition-colors border-border hover:bg-accent/50 min-h-[44px]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.title}</p>
                          {!selectedCase && (
                            <>
                              <p className="text-xs text-muted-foreground">
                                Fall: {relatedCase?.title || "Unbekannt"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Klient: {clientName}
                              </p>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.date).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <DocumentationStatusBadge status={doc.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Documentation Detail View
    if (teamLevel === "docDetail" && selectedClient && selectedCase && selectedDocumentation) {
      return (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              {selectedDocumentation.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-3 sm:space-y-4">
            {/* Context info bar */}
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground pb-2 sm:pb-3 border-b">
              <span>
                <span className="font-medium">Klient:</span> {selectedClient.name}
              </span>
              <span>
                <span className="font-medium">Fall:</span> {selectedCase.title}
              </span>
            </div>

            {/* Basic info */}
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Datum:</span>{" "}
                {new Date(selectedDocumentation.date).toLocaleDateString("de-DE")}
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="font-medium">Status:</span>{" "}
                <DocumentationStatusBadge status={selectedDocumentation.status} />
              </p>
            </div>

            {/* Audio Files */}
            {selectedDocumentation.audioFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2">Audio-Dateien</h4>
                <div className="space-y-2">
                  {selectedDocumentation.audioFiles.map((audio) => (
                    <div
                      key={audio.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{audio.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          Dauer: {formatDuration(audio.durationMs)}
                        </p>
                        <audio
                          id={`audio-${audio.id}`}
                          src={audio.blobUrl}
                          onEnded={() => setPlayingAudioId(null)}
                          className="hidden"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayAudio(audio.id, audio.blobUrl)}
                        className="min-w-[44px] min-h-[36px]"
                      >
                        {playingAudioId === audio.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcripts */}
            {selectedDocumentation.audioFiles.some(af => af.transcriptText) && (
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2">Transkripte</h4>
                <div className="space-y-3">
                  {selectedDocumentation.audioFiles.map((audioFile) =>
                    audioFile.transcriptText ? (
                      <div key={audioFile.id} className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {audioFile.fileName}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">
                          {audioFile.transcriptText}
                        </p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedDocumentation.summaryText && (
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2">Zusammenfassung</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedDocumentation.summaryText}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Team Bereich</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Navigieren Sie durch Klienten, Fälle und Dokumentationen
        </p>
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Suche..."
        value={teamSearch}
        onChange={(e) => setTeamSearch(e.target.value)}
        className="w-full"
      />

      {/* Tabs */}
      <Tabs value={teamActiveTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">Klienten</TabsTrigger>
          <TabsTrigger value="cases">Fälle</TabsTrigger>
          <TabsTrigger value="docs">Dokumentationen</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap gap-1 text-xs sm:text-sm">
          <BreadcrumbItem>
            {teamLevel === "clients" && !selectedClientId ? (
              <BreadcrumbPage>Klienten</BreadcrumbPage>
            ) : (
              <BreadcrumbLink onClick={handleBreadcrumbClients} className="cursor-pointer">
                Klienten
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {selectedClient && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {teamLevel === "cases" && !selectedCaseId ? (
                  <BreadcrumbPage>{selectedClient.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={handleBreadcrumbClient} className="cursor-pointer">
                    {selectedClient.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          )}

          {selectedCase && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {teamLevel === "docs" && !selectedDocumentationId ? (
                  <BreadcrumbPage>{selectedCase.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={handleBreadcrumbCase} className="cursor-pointer">
                    {selectedCase.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          )}

          {selectedDocumentation && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate max-w-[150px] sm:max-w-none">
                  {selectedDocumentation.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Sort Control */}
      <div className="flex items-center justify-end gap-2">
        <label className="text-sm text-muted-foreground flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">Sortierung:</span>
        </label>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
          <SelectTrigger className="w-[160px] sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Neueste zuerst</SelectItem>
            <SelectItem value="asc">Älteste zuerst</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Single content area */}
      <div>{renderContent()}</div>
    </div>
  );
};
