
-- Complete fix for infinite recursion and permission denied errors
-- This approach creates a completely isolated admin check that doesn't depend on RLS

-- First, drop all existing problematic policies on profiles table
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename  = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles;', r.policyname);
  END LOOP;
END;
$$;

-- Enable RLS (in case it was disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User policies

-- View own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Insert own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- View match-partner profiles (direct join, no recursion)
CREATE POLICY "Users can view match partner profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
       WHERE (m.user1_id = auth.uid() AND m.user2_id = public.profiles.id)
          OR (m.user2_id = auth.uid() AND m.user1_id = public.profiles.id)
    )
  );

-- Admin policies (use security-definer helpers)

-- View all profiles
CREATE POLICY "Admin users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_current_user_admin());

-- Update all profiles
CREATE POLICY "Admin users can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_current_user_admin());

-- Insert profiles
CREATE POLICY "Admin users can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_current_user_admin());

-- Helper functions to avoid recursion

-- is_sideby_admin_from_profile
CREATE OR REPLACE FUNCTION public.is_sideby_admin_from_profile(user_id uuid)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  STABLE
AS $$
  SELECT public.is_current_user_admin() AND auth.uid() = user_id;
$$;

-- is_admin_user (checks email domain)
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

  SELECT email
    INTO user_email
    FROM public.profiles
   WHERE id = auth.uid()
   LIMIT 1;

  RETURN user_email LIKE '%@sideby.ai';
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- is_current_user_admin (wrapper)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
AS $$
  SELECT public.is_admin_user();
$$;

-- auth_user_is_admin (alias for RLS)
CREATE OR REPLACE FUNCTION public.auth_user_is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
AS $$
  SELECT public.is_admin_user();
$$;
