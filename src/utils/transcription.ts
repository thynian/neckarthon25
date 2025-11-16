import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const transcribeAudioFile = async (audioId: string, filePath: string) => {
  try {
    toast.info("Transkription wird gestartet...");

    // Call Supabase Edge Function for transcription
    const { data, error } = await supabase.functions.invoke('transcribe-audio', {
      body: { audioFileId: audioId }
    });

    if (error) {
      throw new Error(`Edge Function Fehler: ${error.message}`);
    }

    if (!data.success || !data.transcript) {
      throw new Error("Keine Transkription erhalten");
    }

    toast.success("Transkription erfolgreich abgeschlossen");
    return data.transcript;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    toast.error(`Transkription fehlgeschlagen: ${errorMessage}`);
    throw error;
  }
};
