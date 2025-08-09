-- Replace email_account_type with text in return type
CREATE OR REPLACE FUNCTION public.get_email_template_with_account(template_key_param text)
RETURNS TABLE(
  template_id uuid,
  template_name text,
  subject text,
  header_html text,
  body_html text,
  footer_html text,
  variables jsonb,
  account_type text,
  from_email text,
  from_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    et.account_type::text,
    ea.from_email,
    ea.from_name
  FROM email_templates et
  JOIN email_accounts ea ON et.account_type = ea.account_type
  WHERE et.template_key = template_key_param 
    AND et.status = 'active';
END;
$function$;
