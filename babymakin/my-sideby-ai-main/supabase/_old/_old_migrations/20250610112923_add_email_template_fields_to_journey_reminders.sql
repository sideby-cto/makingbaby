
-- Add new columns to support centralized email templates
ALTER TABLE journey_reminder_templates
ADD COLUMN email_template_id uuid;

ALTER TABLE journey_reminder_templates
ADD CONSTRAINT fk_email_template
FOREIGN KEY (email_template_id) REFERENCES email_templates(id);

ADD COLUMN template_variables text;

-- Add comment to clarify the purpose
COMMENT ON COLUMN journey_reminder_templates.email_template_id IS 'Reference to centralized email template';
COMMENT ON COLUMN journey_reminder_templates.template_variables IS 'Comma-separated list of variables for the email template';
