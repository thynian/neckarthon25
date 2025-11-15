import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ContentArea } from "@/components/ContentArea";
import { Client, Case, Documentation, AudioFile } from "@/types";

type TabType = "offen" | "mein-bereich" | "team-bereich";

interface IndexProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  cases: Case[];
  setCases: React.Dispatch<React.SetStateAction<Case[]>>;
  documentations: Documentation[];
  setDocumentations: React.Dispatch<React.SetStateAction<Documentation[]>>;
  audioFiles: AudioFile[];
  setAudioFiles: React.Dispatch<React.SetStateAction<AudioFile[]>>;
}

const Index = ({
  clients,
  setClients,
  cases,
  setCases,
  documentations,
  setDocumentations,
  audioFiles,
  setAudioFiles,
}: IndexProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("offen");

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <ContentArea
        activeTab={activeTab}
        clients={clients}
        setClients={setClients}
        cases={cases}
        setCases={setCases}
        documentations={documentations}
        setDocumentations={setDocumentations}
        audioFiles={audioFiles}
        setAudioFiles={setAudioFiles}
      />
    </div>
  );
};

export default Index;
