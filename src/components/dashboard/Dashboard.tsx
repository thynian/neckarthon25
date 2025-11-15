import { Client, Case, Documentation, AudioFile } from "@/types";
import { DashboardActions } from "./DashboardActions";
import { OpenDocumentations } from "./OpenDocumentations";
import { AudioFilesList } from "./AudioFilesList";

interface DashboardProps {
  clients: Client[];
  cases: Case[];
  documentations: Documentation[];
  audioFiles: AudioFile[];
  setAudioFiles: React.Dispatch<React.SetStateAction<AudioFile[]>>;
}

export const Dashboard = ({
  cases,
  documentations,
  audioFiles,
  setAudioFiles,
}: DashboardProps) => {
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

      <DashboardActions setAudioFiles={setAudioFiles} />
      
      <OpenDocumentations documentations={documentations} cases={cases} />
      
      <AudioFilesList documentations={documentations} audioFiles={audioFiles} />
    </div>
  );
};
