import { useState } from "react";
import { Client, Case, Documentation, AudioFile } from "@/types";
import { DashboardActions } from "./DashboardActions";
import { OpenDocumentations } from "./OpenDocumentations";
import { AudioFilesList } from "./AudioFilesList";
import { DocumentationDetail } from "../documentation/DocumentationDetail";
import { toast } from "sonner";

interface DashboardProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  documentations: Documentation[];
  setDocumentations: React.Dispatch<React.SetStateAction<Documentation[]>>;
  audioFiles: AudioFile[];
  setAudioFiles: React.Dispatch<React.SetStateAction<AudioFile[]>>;
}

export const Dashboard = ({
  clients,
  setClients,
  cases,
  setCases,
  documentations,
  setDocumentations,
  audioFiles,
  setAudioFiles,
}: DashboardProps) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const handleSaveDocumentation = (documentation: Documentation) => {
    setDocumentations((prev) => [...prev, documentation]);
    console.log("Neue Dokumentation gespeichert:", documentation);
  };

  const handleOpenDocumentation = (docId: string) => {
    setSelectedDocId(docId);
  };

  const handleUpdateDocumentation = (updatedDoc: Documentation) => {
    setDocumentations((prev) =>
      prev.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
    );
    setSelectedDocId(null);
  };

  const selectedDoc = documentations.find((doc) => doc.id === selectedDocId);

  if (selectedDoc) {
    return (
      <DocumentationDetail
        documentation={selectedDoc}
        clients={clients}
        cases={cases}
        audioFiles={audioFiles}
        onBack={() => setSelectedDocId(null)}
        onSave={handleUpdateDocumentation}
      />
    );
  }

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

      <DashboardActions
        clients={clients}
        setClients={setClients}
        cases={cases}
        setCases={setCases}
        audioFiles={audioFiles}
        setAudioFiles={setAudioFiles}
        onSaveDocumentation={handleSaveDocumentation}
      />
      
      <OpenDocumentations
        documentations={documentations}
        cases={cases}
        onOpenDocumentation={handleOpenDocumentation}
      />
      
      <AudioFilesList documentations={documentations} audioFiles={audioFiles} />
    </div>
  );
};
