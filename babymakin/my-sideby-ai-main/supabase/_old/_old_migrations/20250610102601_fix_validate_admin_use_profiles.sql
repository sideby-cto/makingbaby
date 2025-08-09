
-- Fix the validate_admin_operation function to use profiles table instead of auth.users
CREATE OR REPLACE FUNCTION public.validate_admin_operation()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow if user is authenticated and is admin
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check admin status using profiles table instead of auth.users
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  );
END;
$$;
