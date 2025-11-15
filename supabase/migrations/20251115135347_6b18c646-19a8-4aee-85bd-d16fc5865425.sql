-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE case_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE documentation_status AS ENUM ('OPEN', 'IN_REVIEW', 'DONE');

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Create documentations table
CREATE TABLE public.documentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  todos TEXT NOT NULL DEFAULT '',
  status documentation_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  transcript_text TEXT,
  summary_text TEXT
);

-- Create audio_files table
CREATE TABLE public.audio_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  documentation_id UUID NOT NULL REFERENCES public.documentations(id) ON DELETE CASCADE
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  documentation_id UUID NOT NULL REFERENCES public.documentations(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public access for now - can be restricted later with auth)
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to cases" ON public.cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to documentations" ON public.documentations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to audio_files" ON public.audio_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to attachments" ON public.attachments FOR ALL USING (true) WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- Storage RLS Policies
CREATE POLICY "Allow all access to audio files" ON storage.objects FOR ALL USING (bucket_id = 'audio-files') WITH CHECK (bucket_id = 'audio-files');
CREATE POLICY "Allow all access to attachments" ON storage.objects FOR ALL USING (bucket_id = 'attachments') WITH CHECK (bucket_id = 'attachments');

-- Create indexes for better performance
CREATE INDEX idx_cases_client_id ON public.cases(client_id);
CREATE INDEX idx_cases_case_id ON public.cases(case_id);
CREATE INDEX idx_documentations_case_id ON public.documentations(case_id);
CREATE INDEX idx_documentations_status ON public.documentations(status);
CREATE INDEX idx_audio_files_documentation_id ON public.audio_files(documentation_id);
CREATE INDEX idx_attachments_documentation_id ON public.attachments(documentation_id);