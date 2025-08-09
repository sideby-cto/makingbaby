-- Update journey stage configuration to match real user inflection points
-- Clear existing stages first
DELETE FROM journey_stage_config;

-- Insert new journey stages matching the actual user flow
INSERT INTO journey_stage_config (stage, label, display_order, color) VALUES
  ('getting_started', 'Getting Started', 1, '#8B5CF6'),
  ('profile_setup', 'Profile Setup', 2, '#3B82F6'),
  ('first_session_complete', 'First Session Complete', 3, '#10B981'),
  ('awaiting_match', 'Awaiting Match', 4, '#F59E0B'),
  ('matched', 'Matched', 5, '#EF4444'),
  ('scheduling_session', 'Finding Time', 6, '#8B5CF6'),
  ('session_complete', 'Had Conversation', 7, '#10B981'),
  ('active_learner', 'Growing & Learning', 8, '#F59E0B');

-- Create compass view stages for completed users (these represent the 4 quadrants)
INSERT INTO journey_stage_config (stage, label, display_order, color) VALUES
  ('compass_match', 'Match', 100, '#EF4444'),
  ('compass_talk', 'Talk', 101, '#3B82F6'),
  ('compass_learn', 'Learn', 102, '#10B981'),
  ('compass_grow', 'Grow', 103, '#F59E0B');

-- Update the auto_progress_journey_stage function to use new stages
CREATE OR REPLACE FUNCTION public.auto_progress_journey_stage(
  p_user_id UUID,
  p_session_type TEXT,
  p_has_match BOOLEAN DEFAULT FALSE
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stage TEXT;
  new_stage TEXT;
BEGIN
  -- Get current journey stage
  SELECT journey_stage INTO current_stage
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Default to 'getting_started' if no stage set
  IF current_stage IS NULL THEN
    current_stage := 'getting_started';
  END IF;
  
  -- Determine new stage based on current stage and session type
  CASE current_stage
    WHEN 'getting_started' THEN
      -- After joining and setting up basic profile, move to profile_setup
      new_stage := 'profile_setup';
      
    WHEN 'profile_setup' THEN
      -- After completing first session/reflection, move to first_session_complete
      new_stage := 'first_session_complete';
      
    WHEN 'first_session_complete' THEN
      -- If they have a match, move to 'matched', otherwise 'awaiting_match'
      IF p_has_match THEN
        new_stage := 'matched';
      ELSE
        new_stage := 'awaiting_match';
      END IF;
      
    WHEN 'awaiting_match' THEN
      -- If they now have a match, move to 'matched'
      IF p_has_match THEN
        new_stage := 'matched';
      END IF;
      
    WHEN 'matched' THEN
      -- When they start scheduling/finding time, move to scheduling_session
      new_stage := 'scheduling_session';
      
    WHEN 'scheduling_session' THEN
      -- If this is a PAIR session (upduo conversation), move to 'session_complete'
      IF p_session_type = 'PAIR' THEN
        new_stage := 'session_complete';
      END IF;
      
    WHEN 'session_complete' THEN
      -- Multiple completions keep them in 'active_learner'
      new_stage := 'active_learner';
      
    ELSE
      -- Keep current stage for unknown states
      new_stage := current_stage;
  END CASE;
  
  -- Update the profile if stage changed
  IF new_stage != current_stage THEN
    UPDATE public.profiles 
    SET journey_stage = new_stage, updated_at = now()
    WHERE id = p_user_id;
  END IF;
  
  RETURN new_stage;
END;
$$;