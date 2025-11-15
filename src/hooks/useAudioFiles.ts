import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadAudioFile, deleteAudioFile } from "@/utils/storage";

export const useAudioFiles = () => {
  const queryClient = useQueryClient();

  const addAudioFile = useMutation({
    mutationFn: async ({ 
      file, 
      documentationId,
      durationMs 
    }: { 
      file: File; 
      documentationId: string;
      durationMs?: number;
    }) => {
      // Upload to storage
      const { file_path } = await uploadAudioFile(file, documentationId);

      // Create database entry
      const { data, error } = await supabase
        .from("audio_files")
        .insert({
          file_name: file.name,
          file_path,
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
      toast.success("Audiodatei erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  return {
    addAudioFile: addAudioFile.mutateAsync,
    removeAudioFile: removeAudioFile.mutateAsync,
  };
};
