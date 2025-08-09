-- Phase 1: Critical Security Fixes (RLS + Audit Logging with Conditional Safety)

-- Enable RLS and add policies conditionally
DO $$
BEGIN
  -- email_templates
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'email_templates'
  ) THEN
    EXECUTE 'ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY';

    EXECUTE '
      CREATE POLICY "Admin access to email templates" ON public.email_templates
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() 
          AND email LIKE ''%@sideby.ai''
        )
      )';
  ELSE
    RAISE NOTICE '⚠️ email_templates table does not exist — skipping RLS and policy';
  END IF;

  -- email_accounts
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'email_accounts'
  ) THEN
    EXECUTE 'ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY';

    EXECUTE '
      CREATE POLICY "Admin access to email accounts" ON public.email_accounts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() 
          AND email LIKE ''%@sideby.ai''
        )
      )';
  ELSE
    RAISE NOTICE '⚠️ email_accounts table does not exist — skipping RLS and policy';
  END IF;

  -- email_send_logs
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'email_send_logs'
  ) THEN
    EXECUTE 'ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY';

    EXECUTE '
      CREATE POLICY "Admin access to email send logs" ON public.email_send_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() 
          AND email LIKE ''%@sideby.ai''
        )
      )';
  ELSE
    RAISE NOTICE '⚠️ email_send_logs table does not exist — skipping RLS and policy';
  END IF;

  -- email_header_footer_templates
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'email_header_footer_templates'
  ) THEN
    EXECUTE '
      CREATE POLICY "Admin access to header footer templates" ON public.email_header_footer_templates
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() 
          AND email LIKE ''%@sideby.ai''
        )
      )';
  ELSE
    RAISE NOTICE '⚠️ email_header_footer_templates table does not exist — skipping policy';
  END IF;
END;
$$;

-- Admin validation helper (safe for repeated deployments)
CREATE OR REPLACE FUNCTION public.validate_admin_operation()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  );
END;
$$;

-- Audit log table for sensitive ops
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  operation TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and restrict access to admins
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'security_audit_logs'
  ) THEN
    EXECUTE 'ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY';

    EXECUTE '
      CREATE POLICY "Admin access to audit logs" ON public.security_audit_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() 
          AND email LIKE ''%@sideby.ai''
        )
      )';
  END IF;
END;
$$;

-- Trigger function to insert audit entries
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_TABLE_NAME IN ('email_templates', 'email_accounts', 'profiles', 'matches') THEN
    INSERT INTO public.security_audit_logs (
      user_id, operation, table_name, record_id, old_values, new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Conditionally create triggers on target tables
DO $$
DECLARE
  _tbl TEXT;
BEGIN
  FOREACH _tbl IN ARRAY ARRAY['email_templates', 'email_accounts', 'profiles', 'matches']
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = _tbl
    ) THEN
      EXECUTE format('
        CREATE TRIGGER audit_%I
        AFTER INSERT OR UPDATE OR DELETE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();', _tbl, _tbl);
    ELSE
      RAISE NOTICE '⚠️ % table does not exist — skipping audit trigger', _tbl;
    END IF;
  END LOOP;
END;
$$;
