import { Client, Case, Documentation } from "@/types";
import { DashboardActions } from "./DashboardActions";
import { OpenDocumentations } from "./OpenDocumentations";
import { AudioFilesList } from "./AudioFilesList";

interface DashboardProps {
  clients: Client[];
  cases: Case[];
  documentations: Documentation[];
}

export const Dashboard = ({ cases, documentations }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Arbeits-Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Übersicht über offene Dokumentationen und Audiodateien
        </p>
      </div>

      <DashboardActions />
      
      <OpenDocumentations documentations={documentations} cases={cases} />
      
      <AudioFilesList documentations={documentations} />
    </div>
  );
};
