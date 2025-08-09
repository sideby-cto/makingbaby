-- Create session completion tracking table
CREATE TABLE public.session_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'unknown',
  match_id UUID NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  journey_stage_before TEXT NULL,
  journey_stage_after TEXT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.95,
  metadata JSONB DEFAULT '{}',
  next_session_prompted_at TIMESTAMP WITH TIME ZONE NULL,
  next_session_scheduled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own session completions" 
ON public.session_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert session completions" 
ON public.session_completions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own session completions" 
ON public.session_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all session completions" 
ON public.session_completions 
FOR ALL 
USING (is_current_user_admin());

-- Create indexes for performance
CREATE INDEX idx_session_completions_user_id ON public.session_completions(user_id);
CREATE INDEX idx_session_completions_session_id ON public.session_completions(session_id);
CREATE INDEX idx_session_completions_completed_at ON public.session_completions(completed_at);
CREATE INDEX idx_session_completions_next_session_prompted ON public.session_completions(next_session_prompted_at) WHERE next_session_prompted_at IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_session_completions_updated_at
BEFORE UPDATE ON public.session_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically progress journey stages
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
      -- First session completion moves to 'first_session_complete'
      new_stage := 'first_session_complete';
      
    WHEN 'first_session_complete' THEN
      -- If they have a match, move to 'matched'
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
      -- If this is a PAIR session, move to 'session_complete'
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