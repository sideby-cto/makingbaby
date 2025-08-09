-- Migrate compass_quartile_progress table to use LEARN, TALK, GROW, MATCH framework
-- Add new columns for the framework
ALTER TABLE public.compass_quartile_progress 
ADD COLUMN learn_completed boolean NOT NULL DEFAULT false,
ADD COLUMN talk_completed boolean NOT NULL DEFAULT false,
ADD COLUMN grow_completed boolean NOT NULL DEFAULT false,
ADD COLUMN match_completed boolean NOT NULL DEFAULT false;

-- Migrate existing data: map quartiles to new framework
-- quartile_1 -> learn_completed
-- quartile_2 -> talk_completed  
-- quartile_3 -> grow_completed
-- quartile_4 -> match_completed
UPDATE public.compass_quartile_progress 
SET 
  learn_completed = quartile_1,
  talk_completed = quartile_2,
  grow_completed = quartile_3,
  match_completed = quartile_4;

-- Update the compass progress calculation trigger to use new columns
CREATE OR REPLACE FUNCTION public.update_compass_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Calculate progress percentage using new framework
  NEW.progress_percentage := (
    CASE WHEN NEW.learn_completed THEN 25 ELSE 0 END +
    CASE WHEN NEW.talk_completed THEN 25 ELSE 0 END +
    CASE WHEN NEW.grow_completed THEN 25 ELSE 0 END +
    CASE WHEN NEW.match_completed THEN 25 ELSE 0 END
  );
  
  -- Set completed_at timestamp when all areas are complete
  IF NEW.learn_completed AND NEW.talk_completed AND NEW.grow_completed AND NEW.match_completed THEN
    IF OLD.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
  ELSE
    NEW.completed_at := NULL;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Create admin function to toggle compass areas
CREATE OR REPLACE FUNCTION public.admin_toggle_compass_area(target_user_id uuid, area_name text, new_value boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Validate area name
  IF area_name NOT IN ('learn', 'talk', 'grow', 'match') THEN
    RAISE EXCEPTION 'Invalid area name. Must be learn, talk, grow, or match.';
  END IF;
  
  -- Insert or update compass progress
  INSERT INTO public.compass_quartile_progress (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update the specific area
  UPDATE public.compass_quartile_progress
  SET 
    learn_completed = CASE WHEN area_name = 'learn' THEN new_value ELSE learn_completed END,
    talk_completed = CASE WHEN area_name = 'talk' THEN new_value ELSE talk_completed END,
    grow_completed = CASE WHEN area_name = 'grow' THEN new_value ELSE grow_completed END,
    match_completed = CASE WHEN area_name = 'match' THEN new_value ELSE match_completed END
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$function$;