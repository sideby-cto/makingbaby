-- Enable RLS and rewrite policies on profiles (safe even if policies/tables don't exist)

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    -- Drop old policies
    PERFORM 1 FROM pg_policies WHERE policyname = 'Users can view own profiles' AND tablename = 'profiles';
    IF FOUND THEN EXECUTE 'DROP POLICY "Users can view own profiles" ON profiles'; END IF;

    PERFORM 1 FROM pg_policies WHERE policyname = 'Users can update own profiles' AND tablename = 'profiles';
    IF FOUND THEN EXECUTE 'DROP POLICY "Users can update own profiles" ON profiles'; END IF;

    PERFORM 1 FROM pg_policies WHERE policyname = 'Users can view own data' AND tablename = 'profiles';
    IF FOUND THEN EXECUTE 'DROP POLICY "Users can view own data" ON profiles'; END IF;

    PERFORM 1 FROM pg_policies WHERE policyname = 'Users can update own data' AND tablename = 'profiles';
    IF FOUND THEN EXECUTE 'DROP POLICY "Users can update own data" ON profiles'; END IF;

    PERFORM 1 FROM pg_policies WHERE policyname = 'Admin users can view all profiles' AND tablename = 'profiles';
    IF FOUND THEN EXECUTE 'DROP POLICY "Admin users can view all profiles" ON profiles'; END IF;

    PERFORM 1 FROM pg_policies WHERE policyname = 'Admin users can update all profiles' AND tablename = 'profiles';
    IF FOUND THEN EXECUTE 'DROP POLICY "Admin users can update all profiles" ON profiles'; END IF;

    -- Enable RLS
    EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';

    -- Add new policies
    EXECUTE 'CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Users can insert own profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)';
    EXECUTE $sql$
      CREATE POLICY "Admin users can view all profiles" ON profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
        )
      )
    $sql$;
    EXECUTE $sql$
      CREATE POLICY "Admin users can update all profiles" ON profiles
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
        )
      )
    $sql$;
  ELSE
    RAISE NOTICE '⚠️ profiles table does not exist — skipping profile policies';
  END IF;
END;
$$;

-- Rewrite email-related policies using profiles table
DO $$
DECLARE
  _tbl TEXT;
  _pol TEXT;
BEGIN
  FOR _tbl IN SELECT unnest(ARRAY[
    'email_templates',
    'email_accounts',
    'email_send_logs',
    'email_header_footer_templates',
    'admin_alerts'
  ])
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = _tbl AND table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', _tbl);

      -- Drop all existing admin policies (if any)
      FOR _pol IN SELECT policyname FROM pg_policies WHERE tablename = _tbl LOOP
        IF _pol = 'Admin users can manage ' || replace(_tbl, '_', ' ')
           OR _pol = 'Admin users can view ' || replace(_tbl, '_', ' ')
           OR _pol = 'Admin access only'
        THEN
          EXECUTE format('DROP POLICY IF EXISTS "%s" ON %I', _pol, _tbl);
        END IF;
      END LOOP;

      -- Create generic admin policy using profiles.email
      EXECUTE format($fmt$
        CREATE POLICY "Admin users can manage %s" ON %I
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%%@sideby.ai'
          )
        )
      $fmt$, replace(_tbl, '_', ' '), _tbl);
    ELSE
      RAISE NOTICE '⚠️ Table "%" not found — skipping policy rewrite', _tbl;
    END IF;
  END LOOP;
END;
$$;

-- Create admin helper using profiles.email
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND email LIKE '%@sideby.ai'
  );
$$;
