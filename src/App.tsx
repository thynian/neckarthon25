import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Client, Case, Documentation, AudioFile } from "@/types";
import { mockClients, mockCases, mockDocumentations } from "@/data/mockData";

const queryClient = new QueryClient();

const App = () => {
  // Zentrales State-Management für die Datenmodelle
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [documentations, setDocumentations] = useState<Documentation[]>(mockDocumentations);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  clients={clients}
                  setClients={setClients}
                  cases={cases}
                  setCases={setCases}
                  documentations={documentations}
                  setDocumentations={setDocumentations}
                  audioFiles={audioFiles}
                  setAudioFiles={setAudioFiles}
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
