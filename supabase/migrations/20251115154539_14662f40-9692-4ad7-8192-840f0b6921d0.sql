-- Make documentation_id nullable in audio_files table to allow standalone audio files
ALTER TABLE audio_files ALTER COLUMN documentation_id DROP NOT NULL;