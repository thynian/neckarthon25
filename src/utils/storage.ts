import { supabase } from "@/integrations/supabase/client";

export const uploadAudioFile = async (
  file: File,
  documentationId: string
): Promise<{ file_path: string; public_url: string }> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${documentationId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("audio-files")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from("audio-files")
    .getPublicUrl(fileName);

  return {
    file_path: data.path,
    public_url: publicUrl,
  };
};

export const uploadAttachment = async (
  file: File,
  documentationId: string
): Promise<{ file_path: string; public_url: string }> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${documentationId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("attachments")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from("attachments")
    .getPublicUrl(fileName);

  return {
    file_path: data.path,
    public_url: publicUrl,
  };
};

export const deleteAudioFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from("audio-files")
    .remove([filePath]);

  if (error) throw error;
};

export const deleteAttachment = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from("attachments")
    .remove([filePath]);

  if (error) throw error;
};

export const getAudioFileUrl = (filePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from("audio-files")
    .getPublicUrl(filePath);

  return publicUrl;
};

export const getAttachmentUrl = (filePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from("attachments")
    .getPublicUrl(filePath);

  return publicUrl;
};
