import { useState, useEffect } from "react";
import { Dashboard } from "./dashboard/Dashboard";
import { TeamArea } from "./team/TeamArea";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useDocumentations } from "@/hooks/useDocumentations";
import { useAudioFiles } from "@/hooks/useAudioFiles";

type TabType = "offen" | "mein-bereich" | "team-bereich";

interface ContentAreaProps {
  activeTab: TabType;
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

export const ContentArea = ({ activeTab }: ContentAreaProps) => {
  const { clients, isLoading: clientsLoading } = useClients();
  const { cases, isLoading: casesLoading } = useCases();
  const { documentations, isLoading: docsLoading } = useDocumentations();
  
  const content = contentMap[activeTab];

  // Debug-Ausgabe der geladenen Daten
  const dataStats = {
    clients: clients.length,
    cases: cases.length,
    documentations: documentations.length,
    openCases: cases.filter((c) => c.status === "OPEN").length,
    closedCases: cases.filter((c) => c.status === "CLOSED").length,
  };

  const isLoading = clientsLoading || casesLoading || docsLoading;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-content-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-content-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {activeTab === "offen" ? (
          <Dashboard />
        ) : activeTab === "team-bereich" ? (
          <TeamArea 
            clients={clients}
            cases={cases}
            documentations={documentations}
            audioFiles={[]}
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
                <div className="rounded-md bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Offene Fälle</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {dataStats.openCases}
                  </p>
                </div>
                <div className="rounded-md bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">
                    Geschlossene Fälle
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {dataStats.closedCases}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
