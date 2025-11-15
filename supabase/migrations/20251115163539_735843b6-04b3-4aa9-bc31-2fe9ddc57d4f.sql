-- Add transcript_text column to audio_files table
ALTER TABLE audio_files 
ADD COLUMN transcript_text TEXT;