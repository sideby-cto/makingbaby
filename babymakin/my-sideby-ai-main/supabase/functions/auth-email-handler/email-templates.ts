import { emailStyles, generateEmailTemplate } from "./emailStyles.ts";

interface EmailContentResult {
  subject: string;
  html: string;
}

export function generateEmailContent(
  type: string, 
  actionLink: string, 
  passwordResetLink: string, 
  siteUrl: string
): EmailContentResult {
  console.log("Generating email content for type:", type);
  
  // Input validation
  if (!type) {
    console.error("Email type is required");
    type = "signup"; // Default fallback
  }
  
  if (!actionLink) {
    console.error("Action link is missing, using site URL as fallback");
    actionLink = siteUrl || "https://my.sideby.ai";
  }
  
  if (!passwordResetLink) {
    console.error("Password reset link is missing, using action link as fallback");
    passwordResetLink = actionLink || siteUrl || "https://my.sideby.ai";
  }
  
  if (!siteUrl) {
    console.error("Site URL is missing, using default");
    siteUrl = "https://my.sideby.ai";
  }
  
  const currentYear = new Date().getFullYear();
  let subject = "";
  let content = "";
  
  try {
    switch(type){
    case "signup":
      subject = "Welcome to sideby - Confirm Your Email";
      content = `
        <!-- Headline -->
        <h1 class="headline" style="font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 88px; font-weight: bold; line-height: 100%; letter-spacing: 0.02em; color: #401612; margin: 0 0 24px 0; text-align: center;">
          Confirm your sign up
        </h1>
        
        <!-- Body text -->
        <div class="body" style="font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 20px; font-weight: 400; line-height: 150%; letter-spacing: 0; color: #401612; margin: 0 0 32px 0; text-align: center;">
          <p style="margin: 0 0 16px 0;">Thank you for signing up with sideby! To complete your registration, please</p>
          <p style="margin: 0;">confirm your email by clicking the button below.</p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${actionLink}" class="cta-button" style="display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 30px; font-weight: 400; line-height: 110%; letter-spacing: -0.02em; padding: 16px 32px; border-radius: 6px; text-decoration: none; border: none;">
            Confirm Your Email
          </a>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; text-align: center; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 14px; color: #401612; line-height: 150%;">
          <p style="margin: 0;">If you did not sign up for this account, please disregard this email.</p>
        </div>`;
      break;
    case "recovery":
      subject = "sideby - Reset Your Password";
      content = `
        <!-- Headline -->
        <h1 class="headline" style="font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 88px; font-weight: bold; line-height: 100%; letter-spacing: 0.02em; color: #401612; margin: 0 0 24px 0; text-align: center;">
          Reset Your Password
        </h1>
        
        <!-- Body text -->
        <div class="body" style="font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 20px; font-weight: 400; line-height: 150%; letter-spacing: 0; color: #401612; margin: 0 0 32px 0; text-align: center;">
          <p style="margin: 0 0 16px 0;">You requested to reset your password. Click the button below to set a new password:</p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${passwordResetLink}" class="cta-button" style="display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 30px; font-weight: 400; line-height: 110%; letter-spacing: -0.02em; padding: 16px 32px; border-radius: 6px; text-decoration: none; border: none;">
            Reset Password
          </a>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; text-align: center; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 14px; color: #401612; line-height: 150%;">
          <p style="margin: 0;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>`;
      break;
    case "magiclink":
      subject = "sideby - Your Magic Link";
      content = `
        <!-- Headline -->
        <h1 class="headline" style="font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 88px; font-weight: bold; line-height: 100%; letter-spacing: 0.02em; color: #401612; margin: 0 0 24px 0; text-align: center;">
          Sign In to sideby
        </h1>
        
        <!-- Body text -->
        <div class="body" style="font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 20px; font-weight: 400; line-height: 150%; letter-spacing: 0; color: #401612; margin: 0 0 32px 0; text-align: center;">
          <p style="margin: 0 0 16px 0;">Click the link below to sign in to your account:</p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${actionLink}" class="cta-button" style="display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 30px; font-weight: 400; line-height: 110%; letter-spacing: -0.02em; padding: 16px 32px; border-radius: 6px; text-decoration: none; border: none;">
            Sign In
          </a>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; text-align: center; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 14px; color: #401612; line-height: 150%;">
          <p style="margin: 0;">If you didn't request this link, you can safely ignore this email.</p>
        </div>`;
      break;
    case "invite":
      subject = "sideby - You've Been Invited";
      content = `
        <!-- Headline -->
        <h1 class="headline" style="font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 88px; font-weight: bold; line-height: 100%; letter-spacing: 0.02em; color: #401612; margin: 0 0 24px 0; text-align: center;">
          You've Been Invited to sideby
        </h1>
        
        <!-- Body text -->
        <div class="body" style="font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 20px; font-weight: 400; line-height: 150%; letter-spacing: 0; color: #401612; margin: 0 0 32px 0; text-align: center;">
          <p style="margin: 0 0 16px 0;">You have been invited to join sideby. Click the link below to accept the invitation:</p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${actionLink}" class="cta-button" style="display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 30px; font-weight: 400; line-height: 110%; letter-spacing: -0.02em; padding: 16px 32px; border-radius: 6px; text-decoration: none; border: none;">
            Accept Invitation
          </a>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; text-align: center; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 14px; color: #401612; line-height: 150%;">
          <p style="margin: 0;">Welcome to sideby!</p>
        </div>`;
      break;
    case "confirmation":
      subject = "sideby - Email Confirmed";
      content = `
        <!-- Headline -->
        <h1 class="headline" style="font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 88px; font-weight: bold; line-height: 100%; letter-spacing: 0.02em; color: #401612; margin: 0 0 24px 0; text-align: center;">
          Email Confirmed!
        </h1>
        
        <!-- Body text -->
        <div class="body" style="font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 20px; font-weight: 400; line-height: 150%; letter-spacing: 0; color: #401612; margin: 0 0 32px 0; text-align: center;">
          <p style="margin: 0 0 16px 0;">Your email has been successfully confirmed.</p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${siteUrl}" class="cta-button" style="display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 30px; font-weight: 400; line-height: 110%; letter-spacing: -0.02em; padding: 16px 32px; border-radius: 6px; text-decoration: none; border: none;">
            Go to sideby
          </a>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; text-align: center; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 14px; color: #401612; line-height: 150%;">
          <p style="margin: 0;">Welcome to sideby!</p>
        </div>`;
      break;
    default:
      console.log("Unknown email type, using default template:", type);
      subject = "sideby - Action Required";
      content = `
        <!-- Headline -->
        <h1 class="headline" style="font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 88px; font-weight: bold; line-height: 100%; letter-spacing: 0.02em; color: #401612; margin: 0 0 24px 0; text-align: center;">
          Action Required
        </h1>
        
        <!-- Body text -->
        <div class="body" style="font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 20px; font-weight: 400; line-height: 150%; letter-spacing: 0; color: #401612; margin: 0 0 32px 0; text-align: center;">
          <p style="margin: 0 0 16px 0;">Please take action on your sideby account by clicking the link below:</p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${actionLink}" class="cta-button" style="display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 30px; font-weight: 400; line-height: 110%; letter-spacing: -0.02em; padding: 16px 32px; border-radius: 6px; text-decoration: none; border: none;">
            Take Action
          </a>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; text-align: center; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 14px; color: #401612; line-height: 150%;">
          <p style="margin: 0;">If you have questions, please contact support.</p>
        </div>`;
    }
    
    // Validate that we have content before generating the template
    if (!content) {
      throw new Error("Email content is empty");
    }
    
    console.log("Generated email content successfully for type:", type);
    const html = generateEmailTemplate(content, currentYear);
    
    // Final validation
    if (!html) {
      throw new Error("Email HTML generation failed");
    }
    
    return {
      subject,
      html
    };
  } catch (error) {
    console.error("Error generating email content for type:", type, "Error:", error);
    
    // Complete fallback template with proper styling
    const fallbackContent = `
      <!-- Headline -->
      <h1 class="headline" style="font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 88px; font-weight: bold; line-height: 100%; letter-spacing: 0.02em; color: #401612; margin: 0 0 24px 0; text-align: center;">
        Welcome to sideby
      </h1>
      
      <!-- Body text -->
      <div class="body" style="font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 20px; font-weight: 400; line-height: 150%; letter-spacing: 0; color: #401612; margin: 0 0 32px 0; text-align: center;">
        <p style="margin: 0 0 16px 0;">Please take action on your sideby account by clicking the link below:</p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${actionLink}" class="cta-button" style="display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 30px; font-weight: 400; line-height: 110%; letter-spacing: -0.02em; padding: 16px 32px; border-radius: 6px; text-decoration: none; border: none;">
          Take Action
        </a>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; text-align: center; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 14px; color: #401612; line-height: 150%;">
        <p style="margin: 0;">If you have questions, please contact support.</p>
      </div>
    `;
    
    return {
      subject: "sideby - Action Required",
      html: generateEmailTemplate(fallbackContent, currentYear)
    };
  }
}
