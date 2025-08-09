-- Create compass quartile progress table
CREATE TABLE public.compass_quartile_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quartile_1 BOOLEAN NOT NULL DEFAULT false,
  quartile_2 BOOLEAN NOT NULL DEFAULT false,
  quartile_3 BOOLEAN NOT NULL DEFAULT false,
  quartile_4 BOOLEAN NOT NULL DEFAULT false,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.compass_quartile_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own compass progress"
ON public.compass_quartile_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own compass progress"
ON public.compass_quartile_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compass progress"
ON public.compass_quartile_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all compass progress"
ON public.compass_quartile_progress
FOR ALL
USING (is_current_user_admin());

-- Create function to update compass progress
CREATE OR REPLACE FUNCTION public.update_compass_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate progress percentage
  NEW.progress_percentage := (
    CASE WHEN NEW.quartile_1 THEN 25 ELSE 0 END +
    CASE WHEN NEW.quartile_2 THEN 25 ELSE 0 END +
    CASE WHEN NEW.quartile_3 THEN 25 ELSE 0 END +
    CASE WHEN NEW.quartile_4 THEN 25 ELSE 0 END
  );
  
  -- Set completed_at timestamp when all quartiles are complete
  IF NEW.quartile_1 AND NEW.quartile_2 AND NEW.quartile_3 AND NEW.quartile_4 THEN
    IF OLD.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
  ELSE
    NEW.completed_at := NULL;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic progress calculation
CREATE TRIGGER update_compass_progress_trigger
BEFORE UPDATE ON public.compass_quartile_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_compass_progress();

-- Admin function to toggle quartiles
CREATE OR REPLACE FUNCTION public.admin_toggle_compass_quartile(
  target_user_id UUID,
  quartile_number INTEGER,
  new_value BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Validate quartile number
  IF quartile_number NOT IN (1, 2, 3, 4) THEN
    RAISE EXCEPTION 'Invalid quartile number. Must be 1, 2, 3, or 4.';
  END IF;
  
  -- Insert or update compass progress
  INSERT INTO public.compass_quartile_progress (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update the specific quartile
  UPDATE public.compass_quartile_progress
  SET 
    quartile_1 = CASE WHEN quartile_number = 1 THEN new_value ELSE quartile_1 END,
    quartile_2 = CASE WHEN quartile_number = 2 THEN new_value ELSE quartile_2 END,
    quartile_3 = CASE WHEN quartile_number = 3 THEN new_value ELSE quartile_3 END,
    quartile_4 = CASE WHEN quartile_number = 4 THEN new_value ELSE quartile_4 END
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to get compass progress for a user
CREATE OR REPLACE FUNCTION public.get_compass_progress(target_user_id UUID)
RETURNS TABLE(
  quartile_1 BOOLEAN,
  quartile_2 BOOLEAN,
  quartile_3 BOOLEAN,
  quartile_4 BOOLEAN,
  progress_percentage INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user can access this data (themselves or admin)
  IF auth.uid() != target_user_id AND NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied.';
  END IF;
  
  RETURN QUERY
  SELECT 
    cqp.quartile_1,
    cqp.quartile_2,
    cqp.quartile_3,
    cqp.quartile_4,
    cqp.progress_percentage,
    cqp.completed_at
  FROM public.compass_quartile_progress cqp
  WHERE cqp.user_id = target_user_id;
  
  -- If no record exists, return default values
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT false, false, false, false, 0, NULL::TIMESTAMP WITH TIME ZONE;
  END IF;
END;
$$;

-- Create back to school compass badge
INSERT INTO public.badges (
  name,
  description,
  badge_type,
  icon_name,
  requirements,
  reward_description
) VALUES (
  'Back to School Compass',
  'Complete all four learning quartiles to earn your back to school compass badge',
  'achievement',
  'compass',
  '{"type": "compass_completion", "quartiles_required": 4}',
  'Unlock your complete learning compass and showcase your back-to-school readiness'
);