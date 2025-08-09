-- Step 1: Drop ALL existing RLS policies on email tables (safe for missing tables)
DO $$
DECLARE
  r record;
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'email_templates',
    'email_accounts',
    'email_send_logs',
    'email_header_footer_templates'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = t AND table_schema = 'public'
    ) THEN
      FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', r.policyname, t);
      END LOOP;
    ELSE
      RAISE NOTICE '⚠️ Skipping % — table not found', t;
    END IF;
  END LOOP;
END;
$$;

-- Step 2: Disable RLS on email tables if they exist
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'email_templates',
    'email_accounts',
    'email_send_logs',
    'email_header_footer_templates'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = t AND table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', t);
    END IF;
  END LOOP;
END;
$$;

-- Step 3: Harden is_admin_user() and wrapper functions
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
AS $$ SELECT public.is_admin_user(); $$;

CREATE OR REPLACE FUNCTION public.auth_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$ SELECT public.is_admin_user(); $$;

-- Step 4: Create clean RLS policies on email tables (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
    EXECUTE '
      CREATE POLICY "Admin users can manage email templates"
      ON public.email_templates
      FOR ALL
      USING (public.is_current_user_admin())
      WITH CHECK (public.is_current_user_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_accounts') THEN
    EXECUTE '
      CREATE POLICY "Admin users can manage email accounts"
      ON public.email_accounts
      FOR ALL
      USING (public.is_current_user_admin())
      WITH CHECK (public.is_current_user_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_send_logs') THEN
    EXECUTE '
      CREATE POLICY "Admin users can manage email logs"
      ON public.email_send_logs
      FOR ALL
      USING (public.is_current_user_admin())
      WITH CHECK (public.is_current_user_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_header_footer_templates') THEN
    EXECUTE '
      CREATE POLICY "Admin users can manage header footer templates"
      ON public.email_header_footer_templates
      FOR ALL
      USING (public.is_current_user_admin())
      WITH CHECK (public.is_current_user_admin())';
  END IF;
END;
$$;

-- Step 5: Create helper function for email template with account join
CREATE OR REPLACE FUNCTION public.get_email_template_with_account_safe(template_key_param text)
RETURNS TABLE(
  template_id uuid, 
  template_name text, 
  subject text, 
  header_html text, 
  body_html text, 
  footer_html text, 
  variables jsonb, 
  from_email text, 
  from_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    et.id,
    et.name,
    et.subject,
    et.header_html,
    et.body_html,
    et.footer_html,
    et.variables,
    ea.from_email,
    ea.from_name
  FROM public.email_templates et
  JOIN public.email_accounts ea ON et.account_type = ea.account_type
  WHERE et.template_key = template_key_param 
    AND et.status = 'active';
END;
$$;

-- Step 6: Debug helper for admin introspection
CREATE OR REPLACE FUNCTION public.debug_admin_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  user_email text;
  is_admin boolean;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', null,
      'email', null,
      'is_admin', false,
      'error', 'No authenticated user'
    );
  END IF;

  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = current_user_id;

  is_admin := user_email LIKE '%@sideby.ai';

  RETURN jsonb_build_object(
    'authenticated', true,
    'user_id', current_user_id,
    'email', user_email,
    'is_admin', is_admin,
    'timestamp', now()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'error', SQLERRM,
      'timestamp', now()
    );
END;
$$;
