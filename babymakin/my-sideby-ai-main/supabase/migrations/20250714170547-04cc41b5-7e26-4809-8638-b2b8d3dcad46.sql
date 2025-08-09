-- Set up email infrastructure for match message notifications

-- Insert default email account
INSERT INTO public.email_accounts (account_type, from_email, from_name, is_default)
VALUES ('robot', 'robot@sideby.ai', 'sideby', true)
ON CONFLICT (account_type) DO UPDATE SET
  from_email = EXCLUDED.from_email,
  from_name = EXCLUDED.from_name,
  is_default = EXCLUDED.is_default;

-- Create email template for match message notifications
INSERT INTO public.email_templates (
  template_key,
  name,
  subject,
  body_html,
  account_type,
  status,
  description,
  variables
) VALUES (
  'match_message_notification',
  'Match Message Notification',
  'New message from {{partner_name}} on sideby',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">New Message on sideby</h1>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Hi {{recipient_name}},
      </p>
      
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        You have received a new message from <strong>{{partner_name}}</strong> in your learning connection:
      </p>
      
      <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
        <p style="font-size: 16px; color: #555; margin: 0; font-style: italic;">
          "{{message_content}}"
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://my.sideby.ai/dashboard" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  display: inline-block;">
          View Message & Reply
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="font-size: 12px; color: #666; margin: 5px 0;">
          You received this email because you have notifications enabled for your sideby learning connections.
        </p>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">
          <a href="https://my.sideby.ai/settings" style="color: #667eea;">Manage notification preferences</a>
        </p>
        <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
          © 2025 sideby - Connecting educators for meaningful learning
        </p>
      </div>
    </div>
  </div>',
  'robot',
  'active',
  'Email template for notifying users about new messages from their learning partners',
  '[
    {"key": "recipient_name", "description": "Name of the message recipient", "required": true},
    {"key": "partner_name", "description": "Name of the person who sent the message", "required": true},
    {"key": "message_content", "description": "Content of the message", "required": true}
  ]'::jsonb
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  account_type = EXCLUDED.account_type,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  variables = EXCLUDED.variables;