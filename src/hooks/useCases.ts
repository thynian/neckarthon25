import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CaseStatus = "OPEN" | "CLOSED";

export type Case = {
  id: string;
  case_id: string;
  client_id: string;
  title: string;
  status: CaseStatus;
  created_at: string;
};

export const useCases = (clientId?: string) => {
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["cases", clientId],
    queryFn: async () => {
      let query = supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (clientId) {
        query = query.eq("client_id", clientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Case[];
    },
  });

  const createCase = useMutation({
    mutationFn: async (caseData: { 
      client_id: string; 
      case_id: string; 
      title: string; 
      status?: CaseStatus 
    }) => {
      const { data, error } = await supabase
        .from("cases")
        .insert(caseData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Fall erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<Case, "title" | "status">> 
    }) => {
      const { data, error } = await supabase
        .from("cases")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Fall erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  return {
    cases,
    isLoading,
    createCase: createCase.mutateAsync,
    updateCase: updateCase.mutateAsync,
  };
};
