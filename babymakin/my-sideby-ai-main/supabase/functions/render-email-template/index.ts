import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RenderEmailRequest {
  templateKey: string;
  variables: Record<string, string>;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { templateKey, variables, userId }: RenderEmailRequest = await req.json();

    console.log('Rendering email template:', { templateKey, variables: Object.keys(variables) });

    // Get the email template with account information
    const { data: templateData, error: templateError } = await supabase
      .rpc('get_email_template_with_account_safe', { template_key_param: templateKey });

    if (templateError) {
      console.error('Error fetching template:', templateError);
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    if (!templateData || templateData.length === 0) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    const template = templateData[0];
    console.log('Found template:', template.template_name);

    // Render the template by replacing variables
    const renderedTemplate = renderTemplate(template, variables);

    // Record analytics if userId is provided
    if (userId && template.template_id) {
      await recordEmailSent(supabase, template.template_id, userId);
    }

    return new Response(JSON.stringify(renderedTemplate), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in render-email-template function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function renderTemplate(template: any, variables: any): any {
  let renderedSubject = template.subject;
  let renderedBodyHtml = template.body_html;
  let renderedHeaderHtml = template.header_html || '';
  let renderedFooterHtml = template.footer_html || '';

  // Add current year to variables if not provided
  const allVariables = {
    current_year: new Date().getFullYear().toString(),
    ...variables
  };

  // Replace variables in all template parts
  for (const [key, value] of Object.entries(allVariables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    renderedSubject = renderedSubject.replace(regex, String(value));
    renderedBodyHtml = renderedBodyHtml.replace(regex, String(value));
    renderedHeaderHtml = renderedHeaderHtml.replace(regex, String(value));
    renderedFooterHtml = renderedFooterHtml.replace(regex, String(value));
  }

  // Combine header, body, and footer into a complete HTML email
  const fullHtml = `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${renderedSubject}</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6; }
        img { max-width: 100%; height: auto; }
        a { color: #FF5733; text-decoration: none; }
        @media screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
        }
      </style>
    </head>
    <body>
      ${renderedHeaderHtml}
      ${renderedBodyHtml}
      ${renderedFooterHtml}
    </body>
    </html>
  `;

  return {
    subject: renderedSubject,
    body_html: fullHtml,
    header_html: renderedHeaderHtml,
    footer_html: renderedFooterHtml,
    from_email: template.from_email,
    from_name: template.from_name,
    template_id: template.template_id,
  };
}

async function recordEmailSent(supabase: any, templateId: string, userId: string): Promise<void> {
  try {
    await supabase
      .from('email_template_analytics')
      .upsert({
        template_id: templateId,
        user_id: userId,
        sent_count: 1,
        last_sent: new Date().toISOString(),
      }, {
        onConflict: 'template_id,user_id',
        ignoreDuplicates: false,
      });
  } catch (error) {
    console.error('Error recording email analytics:', error);
    // Don't throw here, as this is non-critical
  }
}

serve(handler);