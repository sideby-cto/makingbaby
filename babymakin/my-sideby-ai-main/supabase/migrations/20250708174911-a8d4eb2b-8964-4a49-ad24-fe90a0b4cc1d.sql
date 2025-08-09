-- Create configuration table to track custom auth email handler setup
CREATE TABLE IF NOT EXISTS public.auth_email_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handler_function TEXT NOT NULL DEFAULT 'auth-email-handler',
  enabled BOOLEAN NOT NULL DEFAULT true,
  site_url TEXT DEFAULT 'https://my.sideby.ai',
  from_email TEXT DEFAULT 'robot@sideby.ai',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the initial configuration
INSERT INTO public.auth_email_config (
  handler_function, 
  enabled, 
  site_url, 
  from_email
)
VALUES (
  'auth-email-handler', 
  true, 
  'https://my.sideby.ai',
  'robot@sideby.ai'
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the config table
ALTER TABLE public.auth_email_config ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage email configuration
CREATE POLICY "Admin users can manage email config" ON public.auth_email_config
FOR ALL USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_auth_email_config_updated_at
  BEFORE UPDATE ON public.auth_email_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();