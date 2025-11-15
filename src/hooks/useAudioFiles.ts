import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deleteAudioFile } from "@/utils/storage";

export const useAudioFiles = () => {
  const queryClient = useQueryClient();

  const addAudioFile = useMutation({
    mutationFn: async ({ 
      file, 
      documentationId,
      durationMs 
    }: { 
      file: File; 
      documentationId: string | null;
      durationMs?: number;
    }) => {
      // Upload to storage
      const storagePath = documentationId 
        ? `${documentationId}/${Date.now()}.mp3`
        : `standalone/${Date.now()}.mp3`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("audio-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create database entry
      const { data, error } = await supabase
        .from("audio_files")
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          mime_type: file.type,
          duration_ms: durationMs || null,
          documentation_id: documentationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      queryClient.invalidateQueries({ queryKey: ["audio-files"] });
      toast.success("Audiodatei erfolgreich hinzugefügt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Hinzufügen: ${error.message}`);
    },
  });

  const removeAudioFile = useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      // Delete from database
      const { error: dbError } = await supabase
        .from("audio_files")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Delete from storage
      await deleteAudioFile(filePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      queryClient.invalidateQueries({ queryKey: ["audio-files"] });
      toast.success("Audiodatei erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  // Query to fetch all audio files
  const { data: audioFiles = [], isLoading } = useQuery({
    queryKey: ["audio-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return {
    audioFiles,
    isLoading,
    addAudioFile: addAudioFile.mutateAsync,
    removeAudioFile: removeAudioFile.mutateAsync,
  };
};
