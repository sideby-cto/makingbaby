-- Function to handle account linking when a user tries to sign in with Google
-- but already has an email/password account with the same email
CREATE OR REPLACE FUNCTION public.handle_account_linking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_profile_id UUID;
  google_user_email TEXT;
BEGIN
  -- Get the email from the new Google user
  google_user_email := NEW.email;
  
  -- Check if there's already a profile with this email
  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE email = google_user_email AND id != NEW.id;
  
  -- If we found an existing profile, we need to merge the accounts
  IF existing_profile_id IS NOT NULL THEN
    -- Update any data that should be preserved from the existing profile
    -- Keep the original profile data but update the ID to the new auth user
    UPDATE public.profiles 
    SET id = NEW.id
    WHERE id = existing_profile_id;
    
    -- Log the account linking for audit purposes
    INSERT INTO public.security_audit_logs (
      user_id,
      operation,
      table_name,
      record_id,
      new_values
    ) VALUES (
      NEW.id,
      'ACCOUNT_LINK',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'linked_email', google_user_email,
        'original_profile_id', existing_profile_id,
        'new_auth_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to handle account linking on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_account_linking ON auth.users;
CREATE TRIGGER on_auth_user_account_linking
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'provider' = 'google')
  EXECUTE FUNCTION public.handle_account_linking();

-- Update the existing user profile creation function to handle conflicts
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile if it doesn't exist, handling email conflicts
  INSERT INTO public.profiles (id, email, first_name, last_name, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name'),
    CASE WHEN NEW.email LIKE '%@sideby.ai' THEN true ELSE false END
  )
  ON CONFLICT (email) DO UPDATE SET
    -- If there's a conflict, update the existing profile with the new auth ID
    id = EXCLUDED.id,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
  
  RETURN NEW;
END;
$$;