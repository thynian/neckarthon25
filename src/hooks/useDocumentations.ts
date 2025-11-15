import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Documentation, DocumentationStatus, AudioFile, Attachment } from "@/types";

export const useDocumentations = (caseId?: string) => {
  const queryClient = useQueryClient();

  const { data: documentations = [], isLoading } = useQuery({
    queryKey: ["documentations", caseId],
    queryFn: async () => {
      let query = supabase
        .from("documentations")
        .select(`
          *,
          audio_files(*),
          attachments(*)
        `)
        .order("date", { ascending: false });
      
      if (caseId) {
        query = query.eq("case_id", caseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform to match Documentation type
      return (data || []).map(item => ({
        id: item.id,
        caseId: item.case_id,
        title: item.title,
        date: item.date,
        todos: item.todos || "",
        status: item.status as DocumentationStatus,
        createdAt: item.created_at,
        transcriptText: item.transcript_text,
        summaryText: item.summary_text,
        curatedTopics: item.curated_topics ? (Array.isArray(item.curated_topics) ? item.curated_topics : []) : [],
        audioFiles: (item.audio_files || []).map((af: any) => ({
          id: af.id,
          fileName: af.file_name,
          createdAt: af.created_at,
          durationMs: af.duration_ms || 0,
          blobUrl: `${supabase.storage.from('audio-files').getPublicUrl(af.file_path).data.publicUrl}`,
          transcriptText: af.transcript_text,
        })) as AudioFile[],
        attachments: (item.attachments || []).map((att: any) => ({
          id: att.id,
          fileName: att.file_name,
          fileType: att.mime_type,
          size: att.size,
          blobUrl: `${supabase.storage.from('attachments').getPublicUrl(att.file_path).data.publicUrl}`,
        })) as Attachment[],
      })) as Documentation[];
    },
  });

  const createDocumentation = useMutation({
    mutationFn: async (docData: { 
      case_id: string; 
      title: string; 
      date: string; 
      todos?: string;
    }) => {
      const { data, error } = await supabase
        .from("documentations")
        .insert({ ...docData, todos: docData.todos || "" })
        .select(`
          *,
          audio_files(*),
          attachments(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Dokumentation erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });

  const updateDocumentation = useMutation({
    mutationFn: async ({ 
      id, 
      updates,
      audioFiles
    }: { 
      id: string; 
      updates: Record<string, any>;
      audioFiles?: AudioFile[];
    }) => {
      const { data, error } = await supabase
        .from("documentations")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          audio_files(*),
          attachments(*)
        `)
        .single();
      
      if (error) throw error;

      // Update audio files - set documentation_id and transcripts
      if (audioFiles && audioFiles.length > 0) {
        // First, clear all previous audio files for this documentation
        await supabase
          .from("audio_files")
          .update({ documentation_id: null })
          .eq("documentation_id", id);

        // Then set the new audio files
        for (const audioFile of audioFiles) {
          const updateData: any = { documentation_id: id };
          
          if (audioFile.transcriptText !== undefined) {
            updateData.transcript_text = audioFile.transcriptText;
          }
          
          await supabase
            .from("audio_files")
            .update(updateData)
            .eq("id", audioFile.id);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Dokumentation erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const deleteDocumentation = useMutation({
    mutationFn: async (id: string) => {
      // First, release all audio files from this documentation
      await supabase
        .from("audio_files")
        .update({ documentation_id: null })
        .eq("documentation_id", id);

      // Then delete the documentation
      const { error } = await supabase
        .from("documentations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      toast.success("Dokumentation erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  return {
    documentations,
    isLoading,
    createDocumentation: createDocumentation.mutateAsync,
    updateDocumentation: updateDocumentation.mutateAsync,
    deleteDocumentation: deleteDocumentation.mutateAsync,
  };
};
