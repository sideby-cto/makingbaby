
-- Create a table for badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT,
  badge_type TEXT NOT NULL DEFAULT 'achievement',
  requirements JSONB NOT NULL DEFAULT '{}',
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for user badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  progress REAL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Add Row Level Security
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for badges (everyone can view, only admins can modify)
CREATE POLICY "Everyone can view badges" 
  ON public.badges FOR SELECT 
  USING (true);
  
CREATE POLICY "Only admins can insert badges" 
  ON public.badges FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@sideby.ai');
  
CREATE POLICY "Only admins can update badges" 
  ON public.badges FOR UPDATE 
  USING (auth.jwt() ->> 'email' LIKE '%@sideby.ai');
  
CREATE POLICY "Only admins can delete badges" 
  ON public.badges FOR DELETE 
  USING (auth.jwt() ->> 'email' LIKE '%@sideby.ai');

-- Create policies for user_badges
CREATE POLICY "Users can view their own badges" 
  ON public.user_badges FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "System can insert user badges" 
  ON public.user_badges FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'email' LIKE '%@sideby.ai');
  
CREATE POLICY "System can update user badges" 
  ON public.user_badges FOR UPDATE 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' LIKE '%@sideby.ai');

-- Insert the "Sideby Starter" badge
INSERT INTO public.badges (name, description, icon_name, badge_type, requirements, reward_description)
VALUES (
  'Sideby Starter',
  'Get set up with sideby tools to collaborate effectively. Add the scheduler to your toolbox, set up 4 other tools, and create a professional learning goal for ''25-''26.',
  'Award',
  'achievement',
  '{
    "scheduler_added": false,
    "tools_count": 0,
    "learning_goal_created": false,
    "required_tools_count": 4
  }',
  'Personalized support from the sideby team'
);

-- Add an updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_badges
BEFORE UPDATE ON public.badges
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_user_badges
BEFORE UPDATE ON public.user_badges
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
