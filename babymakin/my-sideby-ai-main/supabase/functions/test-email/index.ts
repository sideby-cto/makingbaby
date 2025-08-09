import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    console.log("Test email function called");
    // Parse request body
    const body = await req.json();
    const { email } = body;
    if (!email) {
      throw new Error("Email address is required");
    }
    // Log API key status (safely)
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API key present:", !!apiKey);
    try {
      const data = await resend.emails.send({
        from: "robot@sideby.ai",
        to: [
          email
        ],
        subject: "Test Email - Verification System",
        html: `
          <h1>Email Verification Test</h1>
          <p>This is a test of the email verification system.</p>
          <p>If you're receiving this email, it means our email service is working correctly.</p>
          <p>Best regards,<br>The Team</p>
        `
      });
      console.log("Email sent successfully:", data);
      return new Response(JSON.stringify({
        success: true,
        message: "Test email sent successfully",
        details: data
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Handle rate limit errors
      if (emailError.statusCode === 429 || emailError.message && emailError.message.includes("rate limit")) {
        return new Response(JSON.stringify({
          success: false,
          error: "Email rate limit exceeded. Please try again in a few minutes.",
          errorType: "rate_limit",
          errorObject: JSON.stringify(emailError)
        }), {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      // Handle unverified email domain error
      if (emailError.statusCode === 403 || emailError.message && emailError.message.includes("unverified domain")) {
        return new Response(JSON.stringify({
          success: false,
          error: "Email domain not verified. Please verify your domain in Resend dashboard.",
          errorType: "unverified_domain",
          errorObject: JSON.stringify(emailError)
        }), {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      throw emailError;
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorObject: JSON.stringify(error)
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
