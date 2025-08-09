-- Manually update reflection status for crew+22@sideby.ai
-- This will mark their reflection as complete and update their journey stage

UPDATE public.profiles 
SET 
  has_completed_reflection = true,
  has_partial_reflection = false,
  reflection_quality_score = 75,
  journey_stage = 'matched'
WHERE email = 'crew+22@sideby.ai';

-- Verify the update worked
SELECT 
  email,
  has_completed_reflection,
  has_partial_reflection,
  reflection_quality_score,
  journey_stage
FROM public.profiles 
WHERE email = 'crew+22@sideby.ai';