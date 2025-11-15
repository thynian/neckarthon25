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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          Arbeits-Dashboard
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-muted-foreground">
          Übersicht über offene Dokumentationen und Audiodateien
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <DashboardActions
            clients={clients}
            setClients={setClients}
            cases={cases}
            setCases={setCases}
            audioFiles={audioFiles}
            setAudioFiles={setAudioFiles}
            onSaveDocumentation={handleSaveDocumentation}
          />
        </div>
        
        <div className="lg:col-span-1">
          <OpenDocumentations
            documentations={documentations}
            cases={cases}
            onOpenDocumentation={handleOpenDocumentation}
          />
        </div>
        
        <div className="lg:col-span-1">
          <AudioFilesList documentations={documentations} audioFiles={audioFiles} />
        </div>
      </div>
    </div>
  );
};
