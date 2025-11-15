import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DocumentationStatus = "OPEN" | "IN_REVIEW" | "DONE";

export type AudioFile = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  duration_ms: number | null;
  created_at: string;
  documentation_id: string;
};

export type Attachment = {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size: number;
  created_at: string;
  documentation_id: string;
};

export type Documentation = {
  id: string;
  case_id: string;
  title: string;
  date: string;
  todos: string;
  status: DocumentationStatus;
  created_at: string;
  transcript_text: string | null;
  summary_text: string | null;
  audio_files?: AudioFile[];
  attachments?: Attachment[];
};

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
      return data as Documentation[];
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
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<Documentation, "title" | "date" | "todos" | "status" | "transcript_text" | "summary_text">> 
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
