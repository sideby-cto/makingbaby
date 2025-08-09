-- Fix admin detection function that's missing
CREATE OR REPLACE FUNCTION public.is_sideby_admin_from_profile(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get email from profiles table
  SELECT email INTO user_email
  FROM public.profiles 
  WHERE id = user_id
  LIMIT 1;

  -- Check if email matches admin domain
  RETURN user_email LIKE '%@sideby.ai';
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error to be safe
    RETURN false;
END;
$$;