
-- Update all remaining database functions to use profiles table instead of auth.users
-- This fixes the "permission denied for table users" error

-- Update is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  );
$$;

-- Update can_complete_matches function
CREATE OR REPLACE FUNCTION public.can_complete_matches(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;

-- Update check_user_deletion_safety function
CREATE OR REPLACE FUNCTION public.check_user_deletion_safety(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_info RECORD;
  safety_report jsonb := '{}';
  match_count integer;
  post_count integer;
  comment_count integer;
  is_admin boolean;
BEGIN
  -- Get user basic info from profiles table
  SELECT first_name, last_name, email, created_at, status
  INTO user_info
  FROM profiles 
  WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if user is admin using profiles table
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id_param AND email LIKE '%@sideby.ai'
  ) INTO is_admin;

  -- Count related data
  SELECT COUNT(*) INTO match_count
  FROM matches 
  WHERE user1_id = user_id_param OR user2_id = user_id_param;

  SELECT COUNT(*) INTO post_count
  FROM posts 
  WHERE user_id = user_id_param;

  SELECT COUNT(*) INTO comment_count
  FROM comments 
  WHERE user_id = user_id_param;

  safety_report := jsonb_build_object(
    'user_info', jsonb_build_object(
      'name', CONCAT(user_info.first_name, ' ', user_info.last_name),
      'email', user_info.email,
      'created_at', user_info.created_at,
      'status', user_info.status,
      'is_admin', is_admin
    ),
    'data_impact', jsonb_build_object(
      'matches', match_count,
      'posts', post_count,
      'comments', comment_count
    ),
    'warnings', CASE 
      WHEN is_admin THEN jsonb_build_array('User is an admin - deletion requires extra caution')
      WHEN match_count > 0 THEN jsonb_build_array('User has active matches that will be deleted')
      WHEN post_count > 10 THEN jsonb_build_array('User has significant community content that will be anonymized')
      ELSE jsonb_build_array()
    END
  );

  RETURN jsonb_build_object(
    'success', true,
    'safety_report', safety_report
  );
END;
$$;

-- Add is_sideby_admin function that uses profiles table
CREATE OR REPLACE FUNCTION public.is_sideby_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;

-- Add is_sideby_admin_from_profile function
CREATE OR REPLACE FUNCTION public.is_sideby_admin_from_profile(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND email LIKE '%@sideby.ai'
  );
$$;

-- Update get_user_data function to use profiles table
CREATE OR REPLACE FUNCTION public.get_user_data(user_id uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    json_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'updated_at', updated_at
    )
  FROM public.profiles
  WHERE id = user_id;
$$;

-- Update get_user_last_signin function - this one needs to keep auth.users access but make it safer
CREATE OR REPLACE FUNCTION public.get_user_last_signin(user_id uuid)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_signin timestamp with time zone;
BEGIN
  -- Only allow access if the requesting user is an admin or requesting their own data
  IF auth.uid() != user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  ) THEN
    RETURN NULL;
  END IF;
  
  -- This function needs auth.users access for last_sign_in_at
  -- We'll use a safer approach with error handling
  BEGIN
    SELECT last_sign_in_at INTO last_signin
    FROM auth.users
    WHERE id = user_id;
  EXCEPTION
    WHEN insufficient_privilege THEN
      -- If we can't access auth.users, return NULL
      RETURN NULL;
  END;
  
  RETURN last_signin;
END;
$$;

-- Update enforce_match_limit function to use is_sideby_admin
CREATE OR REPLACE FUNCTION public.enforce_match_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user creating the match is an admin
  IF public.is_sideby_admin(NEW.created_by) THEN
    -- Admin users can have up to 25 matches
    IF public.count_user_matches(NEW.user1_id) >= 25 OR public.count_user_matches(NEW.user2_id) >= 25 THEN
      RAISE EXCEPTION 'Maximum number of matches (25) reached for one of the users';
    END IF;
  ELSE
    -- Regular users can only have 1 match
    IF public.count_user_matches(NEW.user1_id) >= 1 OR public.count_user_matches(NEW.user2_id) >= 1 THEN
      RAISE EXCEPTION 'Maximum number of matches (1) reached for one of the users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
