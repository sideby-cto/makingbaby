-- Create email templates table if they don't exist
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  header_html TEXT,
  body_html TEXT NOT NULL,
  footer_html TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  account_type email_account_type NOT NULL DEFAULT 'robot',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update email_accounts to ensure it has the right structure
ALTER TABLE public.email_accounts ADD COLUMN IF NOT EXISTS reply_to_email TEXT;

-- Create email send logs table for analytics if not exists  
CREATE TABLE IF NOT EXISTS public.email_send_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  template_key TEXT,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  message_id TEXT,
  error_message TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default email account
INSERT INTO public.email_accounts (account_type, from_email, from_name, reply_to_email)
VALUES ('robot', 'robot@sideby.ai', 'sideby', 'hello@sideby.ai')
ON CONFLICT (account_type) DO UPDATE SET
  from_email = EXCLUDED.from_email,
  from_name = EXCLUDED.from_name,
  reply_to_email = EXCLUDED.reply_to_email,
  updated_at = now();

-- Insert/update match notification email template
INSERT INTO public.email_templates (
  template_key,
  name,
  subject,
  header_html,
  body_html,
  footer_html,
  variables,
  account_type,
  status
) VALUES (
  'match_notification',
  'Match Notification Email',
  'You''ve been matched with {{matched_user_name}}!',
  '<div style="text-align: center; padding: 20px 0;">
    <img src="https://my.sideby.ai/lovable-uploads/4fa666a9-c191-4ff7-9213-c43d4c9fc9aa.png" alt="sideby" width="150" style="display: inline-block;">
  </div>',
  '<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: Arial, sans-serif;">
    <h1 style="color: #FF5733; font-size: 28px; margin-bottom: 20px;">🎉 You''ve got a new learning connection!</h1>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hi {{recipient_name}},
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Great news! You''ve been matched with <strong>{{matched_user_name}}</strong> for collaborative learning.
    </p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF5733;">
      <h3 style="color: #FF5733; margin: 0 0 10px 0;">Why this match?</h3>
      <p style="margin: 0; font-style: italic; line-height: 1.5;">{{rationale}}</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      This connection has been carefully curated based on your learning goals, interests, and compatibility. We think you''ll learn great things together!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://my.sideby.ai/dashboard" 
         style="background-color: #FF5733; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
        Connect with {{matched_user_name}}
      </a>
    </div>
    
    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #1a5f7a; font-size: 14px;">
        💡 <strong>Pro tip:</strong> Great learning partnerships start with sharing your goals and current challenges. Don''t be shy about reaching out!
      </p>
    </div>
  </div>',
  '<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
    <p>You received this email because you''re a member of the sideby learning community.</p>
    <p><a href="https://my.sideby.ai/settings" style="color: #FF5733; text-decoration: none;">Manage notifications</a></p>
    <p style="color: #999;">&copy; {{current_year}} sideby</p>
  </div>',
  '[
    {"name": "recipient_name", "description": "Name of the email recipient"},
    {"name": "matched_user_name", "description": "Name of the matched user"},
    {"name": "rationale", "description": "Explanation of why this match was made"},
    {"name": "current_year", "description": "Current year for copyright"}
  ]',
  'robot',
  'active'
) ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  header_html = EXCLUDED.header_html,
  body_html = EXCLUDED.body_html,
  footer_html = EXCLUDED.footer_html,
  variables = EXCLUDED.variables,
  account_type = EXCLUDED.account_type,
  status = EXCLUDED.status,
  updated_at = now();

-- Add welcome email template
INSERT INTO public.email_templates (
  template_key,
  name,
  subject,
  header_html,
  body_html,
  footer_html,
  variables,
  account_type,
  status
) VALUES (
  'welcome_email',
  'Welcome Email',
  'Welcome to sideby, {{user_name}}!',
  '<div style="text-align: center; padding: 20px 0;">
    <img src="https://my.sideby.ai/lovable-uploads/4fa666a9-c191-4ff7-9213-c43d4c9fc9aa.png" alt="sideby" width="150" style="display: inline-block;">
  </div>',
  '<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: Arial, sans-serif;">
    <h1 style="color: #FF5733; font-size: 28px; margin-bottom: 20px;">Welcome to sideby! 🚀</h1>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hi {{user_name}},
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Welcome to the sideby learning community! We''re excited to have you join thousands of educators who are transforming their practice through collaborative learning.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://my.sideby.ai/dashboard" 
         style="background-color: #FF5733; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
        Get Started
      </a>
    </div>
    
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Ready to begin your learning journey? Your dashboard is waiting for you!
    </p>
  </div>',
  '<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
    <p>You received this email because you signed up for sideby.</p>
    <p><a href="https://my.sideby.ai/settings" style="color: #FF5733; text-decoration: none;">Manage notifications</a></p>
    <p style="color: #999;">&copy; {{current_year}} sideby</p>
  </div>',
  '[
    {"name": "user_name", "description": "Name of the new user"},
    {"name": "current_year", "description": "Current year for copyright"}
  ]',
  'robot',
  'active'
) ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  header_html = EXCLUDED.header_html,
  body_html = EXCLUDED.body_html,
  footer_html = EXCLUDED.footer_html,
  variables = EXCLUDED.variables,
  account_type = EXCLUDED.account_type,
  status = EXCLUDED.status,
  updated_at = now();

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates (read-only for authenticated users, write for admins)
DROP POLICY IF EXISTS "Email templates are viewable by authenticated users" ON public.email_templates;
CREATE POLICY "Email templates are viewable by authenticated users" 
ON public.email_templates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Email templates are manageable by admins" ON public.email_templates;
CREATE POLICY "Email templates are manageable by admins" 
ON public.email_templates 
FOR ALL 
USING (public.is_admin_user());

-- Create policies for email send logs (users can view their own logs, admins can view all)
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_send_logs;
CREATE POLICY "Users can view their own email logs" 
ON public.email_send_logs 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin_user());

DROP POLICY IF EXISTS "Email logs are insertable by authenticated users" ON public.email_send_logs;
CREATE POLICY "Email logs are insertable by authenticated users" 
ON public.email_send_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_templates_updated_at();