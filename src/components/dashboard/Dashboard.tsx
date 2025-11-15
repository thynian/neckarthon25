import { useState } from "react";
import { DashboardActions } from "./DashboardActions";
import { OpenDocumentations } from "./OpenDocumentations";
import { AudioFilesList } from "./AudioFilesList";
import { DocumentationDetail } from "../documentation/DocumentationDetail";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useDocumentations } from "@/hooks/useDocumentations";
import type { Documentation } from "@/types";
export const Dashboard = () => {
  const {
    clients
  } = useClients();
  const {
    cases
  } = useCases();
  const {
    documentations,
    updateDocumentation,
    deleteDocumentation
  } = useDocumentations();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const handleOpenDocumentation = (docId: string) => {
    setSelectedDocId(docId);
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
    setSelectedDocId(null);
  };
  const handleDeleteDocumentation = async (docId: string) => {
    await deleteDocumentation(docId);
    setSelectedDocId(null);
  };
  const selectedDoc = documentations.find(doc => doc.id === selectedDocId);
  if (selectedDoc) {
    return <DocumentationDetail documentation={selectedDoc} clients={clients} cases={cases} audioFiles={selectedDoc.audioFiles || []} onBack={() => setSelectedDocId(null)} onSave={handleUpdateDocumentation} onDelete={handleDeleteDocumentation} />;
  }
  return <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          Mein Dashboard


        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-muted-foreground">
          Übersicht über meine offene Dokumentationen und Audiodateien
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <DashboardActions />
        </div>
        
        <div className="lg:col-span-1">
          <OpenDocumentations documentations={documentations} cases={cases} onOpenDocumentation={handleOpenDocumentation} />
        </div>
        
        <div className="lg:col-span-1">
          <AudioFilesList />
        </div>
      </div>
    </div>;
};