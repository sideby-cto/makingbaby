
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./constants.ts";
import { EmailService } from "./email-service.ts";
import { generateEmailContent } from "./email-templates.ts";
import { constructLinks } from "./url-utils.ts";

let emailService: EmailService;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log("Auth email handler function called");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Parse request body with validation
    let body: any;
    try {
      body = await req.json();
      console.log("Full webhook payload:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      throw new Error("Invalid JSON in request body");
    }
    
    if (!body) {
      console.error("Request body is empty");
      throw new Error("Request body is required");
    }
    
    // Handle both direct calls and auth webhook format
    let type: string, email: string, data: any;
    
    if (body.event && body.user) {
      // Supabase auth webhook format
      console.log("Processing Supabase auth webhook");
      const event = body.event;
      email = body.user?.email;
      data = body.user;
      
      // Validate webhook data
      if (!event) {
        console.error("Missing event in webhook payload");
        throw new Error("Missing event in webhook payload");
      }
      
      if (!body.user) {
        console.error("Missing user in webhook payload");
        throw new Error("Missing user in webhook payload");
      }
      
      // Log the user object to see what tokens are available
      console.log("User object from webhook:", JSON.stringify(body.user, null, 2));
      
      // Map Supabase auth events to our email types
      switch(event) {
        case 'user.confirmation.requested':
        case 'user.signup':
          type = 'signup';
          break;
        case 'user.recovery.requested':
          type = 'recovery';
          break;
        case 'user.invite':
          type = 'invite';
          break;
        case 'user.email_change.requested':
          type = 'confirmation';
          break;
        default:
          console.log("Unknown event type, using signup as fallback:", event);
          type = 'signup'; // fallback
      }
      
      console.log(`Mapped event '${event}' to type '${type}'`);
    } else {
      // Direct call format (existing functionality)
      console.log("Processing direct function call");
      type = body.type;
      email = body.email;
      data = body.data;
      
      // Validate direct call data
      if (!type) {
        console.error("Missing type in direct call");
        throw new Error("Missing type in direct call");
      }
    }
    
    console.log("Email request type:", type);
    console.log("Email recipient:", email);
    console.log("Data object for token extraction:", JSON.stringify(data, null, 2));
    
    // Validate email address
    if (!email) {
      console.error("No email address found in request");
      throw new Error("Email address is required");
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email address format:", email);
      throw new Error("Invalid email address format");
    }

    // Validate API key
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API key present:", !!apiKey);
    console.log("API key starts with:", apiKey ? apiKey.substring(0, 10) + "..." : "not found");
    
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }
    
    // Initialize EmailService if not already done
    if (!emailService) {
      console.log("Initializing EmailService");
      try {
        emailService = new EmailService();
      } catch (serviceError) {
        console.error("Failed to initialize EmailService:", serviceError);
        throw new Error("Failed to initialize email service");
      }
    }
    
    // Generate links for the email
    console.log("Constructing links for email type:", type);
    let siteUrl: string, actionLink: string, passwordResetLink: string;
    
    try {
      const links = constructLinks(type, req, data);
      siteUrl = links.siteUrl;
      actionLink = links.actionLink;
      passwordResetLink = links.passwordResetLink;
      console.log("Generated links:", { siteUrl, actionLink, passwordResetLink });
    } catch (linkError) {
      console.error("Failed to construct links:", linkError);
      throw new Error("Failed to construct email links");
    }
    
    // Get email content based on the type
    console.log("Generating email content for type:", type);
    let subject: string, html: string;
    
    try {
      const content = generateEmailContent(type, actionLink, passwordResetLink, siteUrl);
      subject = content.subject;
      html = content.html;
      console.log("Generated email content successfully");
    } catch (contentError) {
      console.error("Failed to generate email content:", contentError);
      throw new Error("Failed to generate email content");
    }
    
    // Validate the generated content
    if (!subject || !html) {
      console.error("Email generation failed - missing subject or html");
      throw new Error("Email generation failed - missing subject or html content");
    }
    
    // Additional validation for HTML content
    if (html.length < 100) {
      console.error("Generated HTML seems too short:", html.length);
      throw new Error("Generated email content appears to be incomplete");
    }
    
    // Send the email
    console.log("About to send email with subject:", subject);
    console.log("Generated actionLink:", actionLink);
    console.log("Email HTML preview (first 200 chars):", html.substring(0, 200));
    
    let emailResponse: any;
    try {
      emailResponse = await emailService.sendEmail(email, subject, html);
      console.log("Email service response:", JSON.stringify(emailResponse, null, 2));
    } catch (sendError) {
      console.error("Failed to send email:", sendError);
      throw new Error("Failed to send email");
    }
    
    if (!emailResponse) {
      console.error("Email service returned null response");
      throw new Error("Email service returned null response");
    }
    
    return new Response(JSON.stringify(emailResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: emailResponse.success ? 200 : (emailResponse.errorType === "rate_limit" ? 429 : 500)
    });

  } catch (error) {
    console.error("Error sending auth email:", error);
    
    // Return detailed error information for debugging
    const errorResponse = {
      success: false,
      error: error.message,
      errorStack: error.stack,
      apiKeyStatus: !!Deno.env.get("RESEND_API_KEY") ? "present" : "missing",
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
