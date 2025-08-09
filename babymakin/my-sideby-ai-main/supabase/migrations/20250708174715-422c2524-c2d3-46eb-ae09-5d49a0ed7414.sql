-- Configure Supabase to use custom auth email handler
-- This replaces the default Supabase auth email templates with our custom handler

-- First, we need to set up the auth hook configuration
-- This tells Supabase to call our custom edge function for auth emails

-- Create auth hook configuration for custom email handler
INSERT INTO auth.hooks (hook_name, event, function_name, enabled)
VALUES 
  ('custom_auth_email', 'auth.signup', 'auth-email-handler', true),
  ('custom_auth_email_recovery', 'auth.password_recovery', 'auth-email-handler', true),
  ('custom_auth_email_invite', 'auth.user_invited', 'auth-email-handler', true),
  ('custom_auth_email_confirmation', 'auth.email_change', 'auth-email-handler', true)
ON CONFLICT (hook_name, event) DO UPDATE SET
  function_name = EXCLUDED.function_name,
  enabled = EXCLUDED.enabled;

-- Enable custom email templates by setting the auth configuration
-- This disables Supabase's built-in email templates
UPDATE auth.config SET 
  enable_signup = true,
  enable_confirmations = true,
  email_confirm_text = '',
  email_action_text = '',
  email_change_confirm_text = '',
  recovery_text = '';

-- Create a configuration record to track our custom email handler setup
CREATE TABLE IF NOT EXISTS public.auth_email_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handler_function TEXT NOT NULL DEFAULT 'auth-email-handler',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the initial configuration
INSERT INTO public.auth_email_config (handler_function, enabled)
VALUES ('auth-email-handler', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the config table
ALTER TABLE public.auth_email_config ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage email configuration
CREATE POLICY "Admin users can manage email config" ON public.auth_email_config
FOR ALL USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());