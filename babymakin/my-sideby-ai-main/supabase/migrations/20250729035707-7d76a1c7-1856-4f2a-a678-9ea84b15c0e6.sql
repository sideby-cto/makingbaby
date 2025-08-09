-- Create activity_scores table to track user activity metrics
CREATE TABLE IF NOT EXISTS public.activity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0,
  login_frequency_score INTEGER NOT NULL DEFAULT 0,
  engagement_score INTEGER NOT NULL DEFAULT 0,
  recent_activity_score INTEGER NOT NULL DEFAULT 0,
  match_interaction_score INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.activity_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for activity scores
CREATE POLICY "Users can view their own activity scores" 
ON public.activity_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity scores" 
ON public.activity_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity scores" 
ON public.activity_scores 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity scores" 
ON public.activity_scores 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  )
);

-- Create function to update activity scores updated_at
CREATE OR REPLACE FUNCTION public.update_activity_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activity_scores_updated_at
BEFORE UPDATE ON public.activity_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_activity_scores_updated_at();

-- Create activity_based_matches table for tracking activity-based matches
CREATE TABLE IF NOT EXISTS public.activity_based_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_score_difference INTEGER NOT NULL DEFAULT 0,
  compatibility_score DECIMAL(4,2) NOT NULL DEFAULT 0.0,
  match_reasoning JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'suggested',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT activity_score_diff_valid CHECK (activity_score_difference >= 0)
);

-- Enable RLS
ALTER TABLE public.activity_based_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for activity-based matches
CREATE POLICY "Users can view their own activity matches" 
ON public.activity_based_matches 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Admins can manage all activity matches" 
ON public.activity_based_matches 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  )
);

-- Create trigger for activity-based matches timestamp updates
CREATE TRIGGER update_activity_based_matches_updated_at
BEFORE UPDATE ON public.activity_based_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();