import { useState } from "react";
import { Client, Case, Documentation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TeamAreaProps {
  clients: Client[];
  cases: Case[];
  documentations: Documentation[];
}

type TeamLevel = "clients" | "cases" | "docs" | "docDetail";

export const TeamArea = ({ clients, cases, documentations }: TeamAreaProps) => {
  const [teamSearch, setTeamSearch] = useState("");
  const [teamLevel, setTeamLevel] = useState<TeamLevel>("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [selectedDocumentationId, setSelectedDocumentationId] = useState<string | undefined>();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

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

  // Navigation handlers
  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedCaseId(undefined);
    setSelectedDocumentationId(undefined);
    setTeamLevel("cases");
  };

  const handleCaseClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setSelectedDocumentationId(undefined);
    setTeamLevel("docs");
  };

  const handleDocumentationClick = (docId: string) => {
    setSelectedDocumentationId(docId);
    setTeamLevel("docDetail");
  };

  const handleBreadcrumbClients = () => {
    setTeamLevel("clients");
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

  // Filter functions
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  // Selected entities
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const selectedDocumentation = documentations.find((d) => d.id === selectedDocumentationId);

  // Render views based on level
  const renderContent = () => {
    // Client List View
    if (teamLevel === "clients") {
      return (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Clienten ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Keine Clienten gefunden
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

    // Case List View for selected client
    if (teamLevel === "cases" && selectedClient) {
      const clientCases = getCasesForClient(selectedClient.id);
      const filteredCases = clientCases.filter((caseItem) =>
        caseItem.title.toLowerCase().includes(teamSearch.toLowerCase()) ||
        caseItem.caseId.toLowerCase().includes(teamSearch.toLowerCase())
      );

      return (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Fälle von {selectedClient.name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {filteredCases.length} Fälle gefunden
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2">
              {filteredCases.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Keine Fälle gefunden
                </p>
              ) : (
                filteredCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => handleCaseClick(caseItem.id)}
                    className="p-3 border rounded-lg cursor-pointer transition-colors border-border hover:bg-accent/50 min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{caseItem.title}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.caseId}</p>
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

    // Documentation List View for selected case
    if (teamLevel === "docs" && selectedClient && selectedCase) {
      const caseDocs = getDocumentationsForCase(selectedCase.id);
      const filteredDocs = caseDocs.filter((doc) =>
        doc.title.toLowerCase().includes(teamSearch.toLowerCase())
      );

      return (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Dokumentationen für Fall: {selectedCase.title}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {filteredDocs.length} Dokumentationen gefunden
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2">
              {filteredDocs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Keine Dokumentationen gefunden
                </p>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleDocumentationClick(doc.id)}
                    className="p-3 border rounded-lg cursor-pointer transition-colors border-border hover:bg-accent/50 min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.date).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                      <Badge variant={doc.status === "OPEN" ? "secondary" : "outline"}>
                        {doc.status}
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
                <span className="font-medium">Client:</span> {selectedClient.name}
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
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={selectedDocumentation.status === "OPEN" ? "secondary" : "outline"}>
                  {selectedDocumentation.status}
                </Badge>
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

            {/* Transcript */}
            {selectedDocumentation.transcriptText && (
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2">Transkript</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedDocumentation.transcriptText}
                  </p>
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
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Team Bereich</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Navigieren Sie durch Clienten, Fälle und Dokumentationen
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

      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap gap-1 text-xs sm:text-sm">
          <BreadcrumbItem>
            {teamLevel === "clients" ? (
              <BreadcrumbPage>Clienten</BreadcrumbPage>
            ) : (
              <BreadcrumbLink onClick={handleBreadcrumbClients} className="cursor-pointer">
                Clienten
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {selectedClient && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {teamLevel === "cases" ? (
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
                {teamLevel === "docs" ? (
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

      {/* Single content area */}
      <div>{renderContent()}</div>
    </div>
  );
};
