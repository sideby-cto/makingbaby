import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  templateKey: string;
  to: string;
  variables: Record<string, string>;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { templateKey, to, variables, userId }: SendEmailRequest = await req.json();

    console.log('Sending email:', { templateKey, to, variables: Object.keys(variables) });

    // First render the template
    const { data: renderedTemplate, error: renderError } = await supabase.functions.invoke('render-email-template', {
      body: { templateKey, variables, userId }
    });

    if (renderError) {
      console.error('Error rendering template:', renderError);
      throw new Error(`Failed to render template: ${renderError.message}`);
    }

    const template = renderedTemplate;
    
    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: `${template.from_name} <${template.from_email}>`,
      to: [to],
      subject: template.subject,
      html: template.body_html,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the email send
    await supabase.from('email_send_logs').insert({
      template_id: template.template_id,
      recipient_email: to,
      subject: template.subject,
      rendered_html: template.body_html,
      variables_used: variables,
      status: 'sent',
      sent_at: new Date().toISOString(),
      account_type: 'robot'
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-email function:', error);
    
    // Log the failed email attempt
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const requestBody = await req.clone().json();
        
        await supabase.from('email_send_logs').insert({
          recipient_email: requestBody.to || 'unknown',
          subject: 'Failed to send',
          status: 'failed',
          error_message: error.message,
          variables_used: requestBody.variables || {},
          account_type: 'robot'
        });
      }
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);