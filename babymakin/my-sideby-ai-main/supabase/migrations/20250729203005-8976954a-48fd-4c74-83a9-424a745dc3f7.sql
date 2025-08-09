-- Fix compass progress synchronization between legacy quartile fields and new completed fields

-- First, update the trigger function to keep both field systems in sync
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
  
  -- Sync legacy quartile fields with new completed fields
  -- Map the 4 areas to the 4 quartiles in a logical order
  NEW.quartile_1 := NEW.learn_completed;  -- Learn = Q1
  NEW.quartile_2 := NEW.talk_completed;   -- Talk = Q2  
  NEW.quartile_3 := NEW.grow_completed;   -- Grow = Q3
  NEW.quartile_4 := NEW.match_completed;  -- Match = Q4
  
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

-- Sync existing data to ensure consistency between both field systems
UPDATE public.compass_quartile_progress
SET 
  -- Sync completed fields from quartile fields where completed fields are false but quartiles are true
  learn_completed = CASE WHEN quartile_1 = true AND learn_completed = false THEN true ELSE learn_completed END,
  talk_completed = CASE WHEN quartile_2 = true AND talk_completed = false THEN true ELSE talk_completed END,
  grow_completed = CASE WHEN quartile_3 = true AND grow_completed = false THEN true ELSE grow_completed END,
  match_completed = CASE WHEN quartile_4 = true AND match_completed = false THEN true ELSE match_completed END,
  -- Sync quartile fields from completed fields where quartiles are false but completed fields are true  
  quartile_1 = CASE WHEN learn_completed = true AND quartile_1 = false THEN true ELSE quartile_1 END,
  quartile_2 = CASE WHEN talk_completed = true AND quartile_2 = false THEN true ELSE quartile_2 END,
  quartile_3 = CASE WHEN grow_completed = true AND quartile_3 = false THEN true ELSE quartile_3 END,
  quartile_4 = CASE WHEN match_completed = true AND quartile_4 = false THEN true ELSE quartile_4 END,
  updated_at = now()
WHERE 
  -- Only update rows where there's actually a mismatch
  (quartile_1 != learn_completed) OR 
  (quartile_2 != talk_completed) OR 
  (quartile_3 != grow_completed) OR 
  (quartile_4 != match_completed);