-- Create enhanced transcript analysis table (WITHOUT FKs initially)
CREATE TABLE IF NOT EXISTS public.enhanced_transcript_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transcript_id UUID,
    user_id UUID,
    emotional_sentiment JSONB NOT NULL,
    engagement_patterns JSONB NOT NULL,
    semantic_topics JSONB NOT NULL,
    expertise_indicators JSONB NOT NULL,
    learning_moments JSONB NOT NULL,
    personality_traits JSONB NOT NULL,
    analysis_version TEXT NOT NULL DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(transcript_id, analysis_version)
);

-- Conditionally add FK to upduo_transcripts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'upduo_transcripts'
  ) THEN
    ALTER TABLE public.enhanced_transcript_analysis
    ADD CONSTRAINT fk_transcript_id
    FOREIGN KEY (transcript_id) REFERENCES public.upduo_transcripts(id) ON DELETE CASCADE;
  ELSE
    RAISE NOTICE '⚠️ upduo_transcripts does not exist yet — skipping FK';
  END IF;
END;
$$;

-- Conditionally add FK to profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.enhanced_transcript_analysis
    ADD CONSTRAINT fk_user_id
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  ELSE
    RAISE NOTICE '⚠️ profiles table does not exist yet — skipping FK';
  END IF;
END;
$$;

-- Indexes for fast filtering and querying
CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_user_id ON public.enhanced_transcript_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_transcript_id ON public.enhanced_transcript_analysis(transcript_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_created_at ON public.enhanced_transcript_analysis(created_at);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_semantic_topics ON public.enhanced_transcript_analysis USING GIN (semantic_topics);
CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_expertise ON public.enhanced_transcript_analysis USING GIN (expertise_indicators);
CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_emotional ON public.enhanced_transcript_analysis USING GIN (emotional_sentiment);

-- Enable RLS
ALTER TABLE public.enhanced_transcript_analysis ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own analysis
CREATE POLICY "Users can view their own enhanced analysis"
  ON public.enhanced_transcript_analysis
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS: Admins can view all (only if is_admin_user() exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'is_admin_user'
    AND pg_function_is_visible(oid)
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can view all enhanced analysis"
      ON public.enhanced_transcript_analysis
      FOR ALL
      USING (public.is_admin_user());
    $policy$;
  ELSE
    RAISE NOTICE '⚠️ is_admin_user() not found — skipping admin RLS policy';
  END IF;
END;
$$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_enhanced_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enhanced_analysis_updated_at
BEFORE UPDATE ON public.enhanced_transcript_analysis
FOR EACH ROW
EXECUTE FUNCTION update_enhanced_analysis_updated_at();
