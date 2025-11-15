import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadAttachment, deleteAttachment } from "@/utils/storage";

export const useAttachments = () => {
  const queryClient = useQueryClient();

  const addAttachment = useMutation({
    mutationFn: async ({ 
      file, 
      documentationId 
    }: { 
      file: File; 
      documentationId: string;
    }) => {
      // Upload to storage
      const { file_path } = await uploadAttachment(file, documentationId);

      // Create database entry
      const { data, error } = await supabase
        .from("attachments")
        .insert({
          file_name: file.name,
          file_path,
          mime_type: file.type,
          size: file.size,
          documentation_id: documentationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Anhang erfolgreich hinzugefügt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Hinzufügen: ${error.message}`);
    },
  });

  const removeAttachment = useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      // Delete from database
      const { error: dbError } = await supabase
        .from("attachments")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // Delete from storage
      await deleteAttachment(filePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Anhang erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  return {
    addAttachment: addAttachment.mutateAsync,
    removeAttachment: removeAttachment.mutateAsync,
  };
};
