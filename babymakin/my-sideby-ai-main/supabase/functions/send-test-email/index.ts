import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { Resend } from "npm:resend@2.0.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { templateId, testEmail, testData } = await req.json();
    console.log(`Sending test email for template: ${templateId} to ${testEmail}`);
    // Get the template
    const { data: template, error: templateError } = await supabase.from('email_templates').select('*').eq('id', templateId).single();
    if (templateError || !template) {
      throw new Error('Template not found');
    }
    // Render the template with test data
    const renderString = (content)=>{
      let rendered = content;
      Object.entries(testData).forEach(([key, value])=>{
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        rendered = rendered.replace(regex, String(value || ''));
      });
      return rendered;
    };
    const subject = `[TEST] ${renderString(template.subject)}`;
    const textContent = renderString(template.content);
    const htmlContent = template.html_content ? renderString(template.html_content) : null;
    // Send the email
    const emailResponse = await resend.emails.send({
      from: `${template.from_name} <${template.from_email}>`,
      to: [
        testEmail
      ],
      subject: subject,
      text: textContent,
      html: htmlContent || `<pre>${textContent}</pre>`
    });
    console.log('Test email sent successfully:', emailResponse);
    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
