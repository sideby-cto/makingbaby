-- Fix the admin_toggle_compass_quartile function to update both quartile and area fields
CREATE OR REPLACE FUNCTION public.admin_toggle_compass_quartile(target_user_id uuid, quartile_number integer, new_value boolean)
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
  
  -- Validate quartile number
  IF quartile_number NOT IN (1, 2, 3, 4) THEN
    RAISE EXCEPTION 'Invalid quartile number. Must be 1, 2, 3, or 4.';
  END IF;
  
  -- Insert or update compass progress with explicit transaction
  INSERT INTO public.compass_quartile_progress (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update both the quartile fields AND the corresponding area completion fields
  -- This prevents the trigger from reverting changes
  UPDATE public.compass_quartile_progress
  SET 
    -- Update quartile fields
    quartile_1 = CASE WHEN quartile_number = 1 THEN new_value ELSE quartile_1 END,
    quartile_2 = CASE WHEN quartile_number = 2 THEN new_value ELSE quartile_2 END,
    quartile_3 = CASE WHEN quartile_number = 3 THEN new_value ELSE quartile_3 END,
    quartile_4 = CASE WHEN quartile_number = 4 THEN new_value ELSE quartile_4 END,
    -- Update corresponding area completion fields  
    learn_completed = CASE WHEN quartile_number = 1 THEN new_value ELSE learn_completed END,
    talk_completed = CASE WHEN quartile_number = 2 THEN new_value ELSE talk_completed END,
    grow_completed = CASE WHEN quartile_number = 3 THEN new_value ELSE grow_completed END,
    match_completed = CASE WHEN quartile_number = 4 THEN new_value ELSE match_completed END,
    -- The trigger will handle progress_percentage and completed_at calculations
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update compass progress for user %', target_user_id;
  END IF;
  
  RETURN TRUE;
END;
$function$