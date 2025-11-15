import { useState } from "react";
import { Client, Case, Documentation, AudioFile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamAreaProps {
  clients: Client[];
  cases: Case[];
  documentations: Documentation[];
}

type TeamTab = "clients" | "cases" | "docs";

export const TeamArea = ({ clients, cases, documentations }: TeamAreaProps) => {
  const [teamSearch, setTeamSearch] = useState("");
  const [teamActiveTab, setTeamActiveTab] = useState<TeamTab>("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [selectedDocumentationId, setSelectedDocumentationId] = useState<string | undefined>();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Helper functions
  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Unbekannt";
  };

  const getCaseTitle = (caseId: string) => {
    const caseItem = cases.find((c) => c.id === caseId);
    return caseItem ? `${caseItem.caseId} - ${caseItem.title}` : "Unbekannt";
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

  // Filter functions
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredCases = cases.filter((caseItem) => {
    const searchLower = teamSearch.toLowerCase();
    const clientName = getClientName(caseItem.clientId).toLowerCase();
    return (
      caseItem.title.toLowerCase().includes(searchLower) ||
      caseItem.caseId.toLowerCase().includes(searchLower) ||
      clientName.includes(searchLower)
    );
  });

  const filteredDocumentations = documentations.filter((doc) => {
    const searchLower = teamSearch.toLowerCase();
    const caseItem = cases.find((c) => c.id === doc.caseId);
    const clientName = caseItem ? getClientName(caseItem.clientId).toLowerCase() : "";
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.date.toLowerCase().includes(searchLower) ||
      clientName.includes(searchLower)
    );
  });

  // Selected entities
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const selectedDocumentation = documentations.find((d) => d.id === selectedDocumentationId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Team Bereich</h1>
        <p className="text-muted-foreground">
          Suchen und navigieren Sie durch Clienten, Fälle und Dokumentationen
        </p>
      </div>

      {/* Search Field */}
      <div>
        <Input
          type="text"
          placeholder="Suche in Clienten, Fällen oder Dokumentationen…"
          value={teamSearch}
          onChange={(e) => setTeamSearch(e.target.value)}
          className="max-w-2xl"
        />
      </div>

      {/* Tabs */}
      <Tabs value={teamActiveTab} onValueChange={(value) => setTeamActiveTab(value as TeamTab)}>
        <TabsList>
          <TabsTrigger value="clients">Clienten</TabsTrigger>
          <TabsTrigger value="cases">Fälle</TabsTrigger>
          <TabsTrigger value="docs">Dokumentationen</TabsTrigger>
        </TabsList>

        {/* Tab: Clienten */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Client List */}
            <Card>
              <CardHeader>
                <CardTitle>Clienten ({filteredClients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredClients.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Keine Clienten gefunden
                    </p>
                  ) : (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setSelectedCaseId(undefined);
                          setSelectedDocumentationId(undefined);
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedClientId === client.id
                            ? "border-primary bg-accent"
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Erstellt: {new Date(client.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right: Client Details with Drilldown */}
            {selectedClient && (
              <div className="space-y-4">
                {/* Client Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Client: {selectedClient.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">ID:</span> {selectedClient.id}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Erstellt:</span>{" "}
                        {new Date(selectedClient.createdAt).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Cases for this Client */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fälle dieses Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getCasesForClient(selectedClient.id).length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          Keine Fälle vorhanden
                        </p>
                      ) : (
                        getCasesForClient(selectedClient.id).map((caseItem) => (
                          <div
                            key={caseItem.id}
                            onClick={() => {
                              setSelectedCaseId(caseItem.id);
                              setSelectedDocumentationId(undefined);
                            }}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedCaseId === caseItem.id
                                ? "border-primary bg-accent"
                                : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{caseItem.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {caseItem.caseId}
                                </p>
                              </div>
                              <Badge
                                variant={caseItem.status === "OPEN" ? "secondary" : "outline"}
                              >
                                {caseItem.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Documentations for selected Case */}
                {selectedCase && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dokumentationen in diesem Fall</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getDocumentationsForCase(selectedCase.id).length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            Keine Dokumentationen vorhanden
                          </p>
                        ) : (
                          getDocumentationsForCase(selectedCase.id).map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => setSelectedDocumentationId(doc.id)}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedDocumentationId === doc.id
                                  ? "border-primary bg-accent"
                                  : "border-border hover:bg-accent/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{doc.title}</p>
                                  <p className="text-sm text-muted-foreground">
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
                )}

                {/* Documentation Details */}
                {selectedDocumentation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dokumentation: {selectedDocumentation.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Datum:</span>{" "}
                          {new Date(selectedDocumentation.date).toLocaleDateString("de-DE")}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <Badge
                            variant={
                              selectedDocumentation.status === "OPEN" ? "secondary" : "outline"
                            }
                          >
                            {selectedDocumentation.status}
                          </Badge>
                        </p>
                      </div>

                      {/* Audio Files */}
                      {selectedDocumentation.audioFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Audio-Dateien</h4>
                          <div className="space-y-2">
                            {selectedDocumentation.audioFiles.map((audio) => (
                              <div
                                key={audio.id}
                                className="flex items-center gap-3 p-3 border border-border rounded-md"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{audio.fileName}</p>
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
                          <h4 className="font-medium mb-2">Transkript</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              {selectedDocumentation.transcriptText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {selectedDocumentation.summaryText && (
                        <div>
                          <h4 className="font-medium mb-2">Zusammenfassung</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              {selectedDocumentation.summaryText}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Cases */}
        <TabsContent value="cases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Cases List */}
            <Card>
              <CardHeader>
                <CardTitle>Fälle ({filteredCases.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredCases.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Keine Fälle gefunden</p>
                  ) : (
                    filteredCases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        onClick={() => {
                          setSelectedCaseId(caseItem.id);
                          setSelectedClientId(caseItem.clientId);
                          setSelectedDocumentationId(undefined);
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCaseId === caseItem.id
                            ? "border-primary bg-accent"
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{caseItem.title}</p>
                          <Badge variant={caseItem.status === "OPEN" ? "secondary" : "outline"}>
                            {caseItem.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{caseItem.caseId}</p>
                        <p className="text-sm text-muted-foreground">
                          Client: {getClientName(caseItem.clientId)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right: Case Details with Drilldown */}
            {selectedCase && (
              <div className="space-y-4">
                {/* Case Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fall: {selectedCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Fall-ID:</span> {selectedCase.caseId}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant={selectedCase.status === "OPEN" ? "secondary" : "outline"}>
                          {selectedCase.status}
                        </Badge>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Erstellt:</span>{" "}
                        {new Date(selectedCase.createdAt).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Info */}
                {selectedClient && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Zugehöriger Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{selectedClient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Erstellt: {new Date(selectedClient.createdAt).toLocaleDateString("de-DE")}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Documentations for this Case */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dokumentationen in diesem Fall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getDocumentationsForCase(selectedCase.id).length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          Keine Dokumentationen vorhanden
                        </p>
                      ) : (
                        getDocumentationsForCase(selectedCase.id).map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => setSelectedDocumentationId(doc.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedDocumentationId === doc.id
                                ? "border-primary bg-accent"
                                : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">
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

                {/* Documentation Details */}
                {selectedDocumentation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dokumentation: {selectedDocumentation.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Datum:</span>{" "}
                          {new Date(selectedDocumentation.date).toLocaleDateString("de-DE")}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <Badge
                            variant={
                              selectedDocumentation.status === "OPEN" ? "secondary" : "outline"
                            }
                          >
                            {selectedDocumentation.status}
                          </Badge>
                        </p>
                      </div>

                      {/* Audio Files */}
                      {selectedDocumentation.audioFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Audio-Dateien</h4>
                          <div className="space-y-2">
                            {selectedDocumentation.audioFiles.map((audio) => (
                              <div
                                key={audio.id}
                                className="flex items-center gap-3 p-3 border border-border rounded-md"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{audio.fileName}</p>
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
                          <h4 className="font-medium mb-2">Transkript</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              {selectedDocumentation.transcriptText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {selectedDocumentation.summaryText && (
                        <div>
                          <h4 className="font-medium mb-2">Zusammenfassung</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">
                              {selectedDocumentation.summaryText}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Documentations */}
        <TabsContent value="docs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Documentation List */}
            <Card>
              <CardHeader>
                <CardTitle>Dokumentationen ({filteredDocumentations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredDocumentations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Keine Dokumentationen gefunden
                    </p>
                  ) : (
                    filteredDocumentations.map((doc) => {
                      const caseItem = cases.find((c) => c.id === doc.caseId);
                      const clientName = caseItem ? getClientName(caseItem.clientId) : "Unbekannt";
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setSelectedDocumentationId(doc.id);
                            setSelectedCaseId(doc.caseId);
                            setSelectedClientId(caseItem?.clientId);
                          }}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedDocumentationId === doc.id
                              ? "border-primary bg-accent"
                              : "border-border hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{doc.title}</p>
                            <Badge variant={doc.status === "OPEN" ? "secondary" : "outline"}>
                              {doc.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.date).toLocaleDateString("de-DE")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Fall: {caseItem?.caseId} - {caseItem?.title}
                          </p>
                          <p className="text-sm text-muted-foreground">Client: {clientName}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right: Documentation Details with Context */}
            {selectedDocumentation && (
              <div className="space-y-4">
                {/* Documentation Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dokumentation: {selectedDocumentation.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Datum:</span>{" "}
                        {new Date(selectedDocumentation.date).toLocaleDateString("de-DE")}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <Badge
                          variant={
                            selectedDocumentation.status === "OPEN" ? "secondary" : "outline"
                          }
                        >
                          {selectedDocumentation.status}
                        </Badge>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Case Info */}
                {selectedCase && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Zugehöriger Fall</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedCase.title}</p>
                        <p className="text-sm text-muted-foreground">{selectedCase.caseId}</p>
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <Badge variant={selectedCase.status === "OPEN" ? "secondary" : "outline"}>
                            {selectedCase.status}
                          </Badge>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Client Info */}
                {selectedClient && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Zugehöriger Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{selectedClient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Erstellt: {new Date(selectedClient.createdAt).toLocaleDateString("de-DE")}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Audio Files */}
                {selectedDocumentation.audioFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Audio-Dateien</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedDocumentation.audioFiles.map((audio) => (
                          <div
                            key={audio.id}
                            className="flex items-center gap-3 p-3 border border-border rounded-md"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{audio.fileName}</p>
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
                    </CardContent>
                  </Card>
                )}

                {/* Transcript */}
                {selectedDocumentation.transcriptText && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Transkript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {selectedDocumentation.transcriptText}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                {selectedDocumentation.summaryText && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Zusammenfassung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {selectedDocumentation.summaryText}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
