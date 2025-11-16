import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Client } from "@/types";

export const useClients = () => {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Transform to match Client type
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        createdAt: item.created_at,
      })) as Client[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Mandant erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Mandant erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Mandant erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  return {
    clients,
    isLoading,
    createClient: createClient.mutateAsync,
    updateClient: updateClient.mutateAsync,
    deleteClient: deleteClient.mutateAsync,
  };
};
