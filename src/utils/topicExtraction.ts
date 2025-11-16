import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const extractTopicsFromTranscripts = async (transcripts: string[]): Promise<string[]> => {
  const combinedTranscript = transcripts.join("\n\n--- Nächste Audio-Datei ---\n\n");

  if (!combinedTranscript || combinedTranscript.trim().length === 0) {
    throw new Error("Keine Transkripte zum Analysieren vorhanden");
  }

  toast.info("Themen werden aus Transkript extrahiert...");

  const { data, error } = await supabase.functions.invoke("extract-topics", {
    body: { transcript: combinedTranscript },
  });

  if (error) {
    throw new Error(error.message || "Fehler beim Extrahieren der Themen");
  }

  if (!data.topics || !Array.isArray(data.topics) || data.topics.length === 0) {
    throw new Error("Keine Themen extrahiert");
  }

  return data.topics;
};
