import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const transcribeAudioFile = async (audioId: string, filePath: string) => {
  try {
    toast.info("Transkription wird gestartet...");

    // Download audio file from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("audio-files")
      .download(filePath);

    if (downloadError) {
      throw new Error(`Fehler beim Laden der Datei: ${downloadError.message}`);
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("file", audioData, filePath.split("/").pop() || "audio.mp3");

    // Send to transcription API
    const response = await fetch("http://app.maltezeimer.de/transcription/upload_file", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const transcript = result.transcript || result.text || "";

    if (!transcript) {
      throw new Error("Kein Transkript in der Antwort erhalten");
    }

    // Update audio file with transcript
    const { error: updateError } = await supabase
      .from("audio_files")
      .update({ transcript_text: transcript })
      .eq("id", audioId);

    if (updateError) {
      throw new Error(`Fehler beim Speichern: ${updateError.message}`);
    }

    toast.success("Transkription erfolgreich abgeschlossen");
    return transcript;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    toast.error(`Transkription fehlgeschlagen: ${errorMessage}`);
    throw error;
  }
};
