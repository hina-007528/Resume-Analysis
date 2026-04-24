-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis results
CREATE TABLE public.analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2) NOT NULL,
  score_label TEXT NOT NULL,
  matched_keywords TEXT[] NOT NULL DEFAULT '{}',
  missing_keywords TEXT[] NOT NULL DEFAULT '{}',
  suggestions TEXT[] NOT NULL DEFAULT '{}',
  job_description_snippet TEXT,     -- first 200 chars for preview
  resume_filename TEXT,
  resume_word_count INT,
  processing_time_ms INT,
  entities JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (downloadable files)
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,           -- Supabase Storage path
  file_type TEXT DEFAULT 'pdf',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- profiles: users can only SELECT/UPDATE their own row
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- analyses: users can SELECT/INSERT/DELETE only their own analyses
CREATE POLICY "Users can view own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL); -- Allow guest view if user_id is null
CREATE POLICY "Users can insert own analyses" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete own analyses" ON public.analyses FOR DELETE USING (auth.uid() = user_id);

-- reports: users can SELECT only reports linked to their own analyses
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.analyses 
    WHERE public.analyses.id = public.reports.analysis_id 
    AND (public.analyses.user_id = auth.uid() OR public.analyses.user_id IS NULL)
  )
);

-- INDEXES
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_reports_analysis_id ON public.reports(analysis_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;
