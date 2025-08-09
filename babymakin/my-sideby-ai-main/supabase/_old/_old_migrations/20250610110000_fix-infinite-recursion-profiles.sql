-- Fix infinite recursion in profiles table RLS policies

-- Drop all existing possibly conflicting RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Users can update own profiles" ON profiles; 
DROP POLICY IF EXISTS "Users can update own profile" ON profiles; 

DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles safe" ON profiles;

DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles safe" ON profiles;

DROP POLICY IF EXISTS "Admin users can insert profiles safe" ON profiles;

DROP POLICY IF EXISTS "Users can view profiles of their match partners" ON profiles;
DROP POLICY IF EXISTS "Users can view match partner profiles" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate non-recursive RLS policies

CREATE POLICY "Users can view own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles safe" 
  ON profiles 
  FOR SELECT 
  USING (public.is_current_user_admin());

CREATE POLICY "Admin users can update all profiles safe" 
  ON profiles 
  FOR UPDATE 
  USING (public.is_current_user_admin());

CREATE POLICY "Admin users can insert profiles safe" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Users can view match partner profiles" 
  ON profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user1_id = auth.uid() AND m.user2_id = profiles.id)
         OR (m.user2_id = auth.uid() AND m.user1_id = profiles.id)
    )
  );

-- Update the admin-checking functions to avoid recursion

CREATE OR REPLACE FUNCTION public.is_sideby_admin_from_profile(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.is_current_user_admin() AND auth.uid() = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT email INTO user_email
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN user_email LIKE '%@sideby.ai';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.is_admin_user();
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.is_admin_user();
$$;
