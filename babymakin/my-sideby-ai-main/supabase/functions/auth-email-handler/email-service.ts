import { Resend } from "npm:resend@2.0.0";

interface EmailResponse {
  success: boolean;
  messageId?: string;
  data?: any;
  error?: string;
  errorType?: string;
}

export class EmailService {
  private resend: Resend;

  constructor() {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY environment variable is missing");
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    console.log("EmailService initialized with API key:", apiKey.substring(0, 10) + "...");
    this.resend = new Resend(apiKey);
  }

  async sendEmail(to: string, subject: string, html: string): Promise<EmailResponse> {
    try {
      console.log(`Sending email to: ${to}`);
      console.log(`Subject: ${subject}`);
      
      const response = await this.resend.emails.send({
        from: 'robot@sideby.ai',
        to: [to],
        subject: subject,
        html: html,
      });

      console.log("Resend response:", JSON.stringify(response, null, 2));

      if (response.error) {
        console.error("Resend error:", response.error);
        return {
          success: false,
          error: response.error.message,
          errorType: response.error.name === "rate_limit_exceeded" ? "rate_limit" : "api_error"
        };
      }

      return {
        success: true,
        messageId: response.data?.id,
        data: response.data
      };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        error: error.message,
        errorType: "unknown_error"
      };
    }
  }
}