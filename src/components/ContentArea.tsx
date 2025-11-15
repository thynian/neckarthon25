import { Client, Case, Documentation } from "@/types";
import { Dashboard } from "./dashboard/Dashboard";

type TabType = "offen" | "mein-bereich" | "team-bereich";

interface ContentAreaProps {
  activeTab: TabType;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  documentations: Documentation[];
  setDocumentations: React.Dispatch<React.SetStateAction<Documentation[]>>;
}

const contentMap: Record<TabType, { title: string; description: string }> = {
  offen: {
    title: "Bereich: Offen",
    description: "Dashboard",
  },
  "mein-bereich": {
    title: "Bereich: Mein Bereich",
    description: "Persönlicher Fokusbereich – später",
  },
  "team-bereich": {
    title: "Bereich: Team Bereich",
    description: "Übersicht für alle Fälle",
  },
};

export const ContentArea = ({
  activeTab,
  clients,
  cases,
  documentations,
}: ContentAreaProps) => {
  const content = contentMap[activeTab];

  // Debug-Ausgabe der geladenen Daten
  const dataStats = {
    clients: clients.length,
    cases: cases.length,
    documentations: documentations.length,
    openCases: cases.filter((c) => c.status === "OPEN").length,
    closedCases: cases.filter((c) => c.status === "CLOSED").length,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-content-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {activeTab === "offen" ? (
          <Dashboard
            clients={clients}
            cases={cases}
            documentations={documentations}
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {content.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {content.description}
              </p>
            </div>

            {/* Daten-Übersicht */}
            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                Datenübersicht
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Clients</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {dataStats.clients}
                  </p>
                </div>
                <div className="rounded-md bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Fälle (Gesamt)</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {dataStats.cases}
                  </p>
                </div>
                <div className="rounded-md bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">
                    Dokumentationen
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {dataStats.documentations}
                  </p>
                </div>
                <div className="rounded-md bg-accent p-4">
                  <p className="text-sm text-muted-foreground">Offene Fälle</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {dataStats.openCases}
                  </p>
                </div>
                <div className="rounded-md bg-accent p-4">
                  <p className="text-sm text-muted-foreground">
                    Geschlossene Fälle
                  </p>
                  <p className="mt-1 text-2xl font-bold text-muted-foreground">
                    {dataStats.closedCases}
                  </p>
                </div>
              </div>
            </div>

            {/* Beispiel-Datenliste */}
            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                Beispiel-Clients
              </h2>
              <div className="space-y-2">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-md bg-secondary p-3"
                  >
                    <span className="font-medium text-foreground">
                      {client.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
