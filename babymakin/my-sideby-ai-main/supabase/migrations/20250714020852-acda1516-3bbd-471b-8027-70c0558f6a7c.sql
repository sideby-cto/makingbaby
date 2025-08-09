-- Remove complex Upduo user attribution system
-- Drop the upduo_user_mappings table as it's causing more problems than it solves
DROP TABLE IF EXISTS public.upduo_user_mappings;

-- Keep upduo_transcripts table but remove user linking requirement
-- Instead, we'll rely on session timing and optional self-reporting
ALTER TABLE public.upduo_transcripts 
DROP CONSTRAINT IF EXISTS upduo_transcripts_user_id_fkey,
ALTER COLUMN user_id DROP NOT NULL;

-- Add optional self-reported session indicator
ALTER TABLE public.upduo_transcripts 
ADD COLUMN IF NOT EXISTS self_reported_match_id uuid REFERENCES public.matches(id);

-- Add session timing metadata for loose correlation
ALTER TABLE public.upduo_transcripts 
ADD COLUMN IF NOT EXISTS session_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS session_ended_at timestamp with time zone;

-- Create a simple view for potential session correlations based on timing
CREATE OR REPLACE VIEW public.potential_session_correlations AS
SELECT 
  ut.id as transcript_id,
  ut.created_at as transcript_time,
  ut.session_started_at,
  ut.session_ended_at,
  ut.metadata,
  m.id as match_id,
  m.created_at as match_created_at,
  p1.first_name as user1_name,
  p2.first_name as user2_name
FROM public.upduo_transcripts ut
CROSS JOIN public.matches m
LEFT JOIN public.profiles p1 ON m.user1_id = p1.id
LEFT JOIN public.profiles p2 ON m.user2_id = p2.id
WHERE 
  -- Only look at transcripts from the last 30 days
  ut.created_at > now() - interval '30 days'
  -- Only active matches
  AND m.status = 'active'
  -- Rough time correlation (transcript within 24 hours of match)
  AND ut.created_at BETWEEN m.created_at - interval '1 hour' AND m.created_at + interval '24 hours';

-- Comment explaining the new approach
COMMENT ON VIEW public.potential_session_correlations IS 'Provides loose correlation between Upduo sessions and Sideby matches based on timing, for informational purposes only. No strict attribution required.';