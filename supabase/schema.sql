-- Create table for resume analyses
CREATE TABLE IF NOT EXISTS resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  resume_name TEXT NOT NULL,
  resume_version INTEGER DEFAULT 1,
  resume_text TEXT NOT NULL,
  analysis_mode TEXT DEFAULT 'general',
  job_description TEXT,
  overall_score INTEGER,
  ats_score INTEGER,
  jd_match_score INTEGER,
  analysis_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- Create Policy
CREATE POLICY "Users can manage their own analyses" ON resume_analyses
  FOR ALL USING (auth.uid() = user_id);
