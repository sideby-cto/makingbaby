
import { supabase } from "@/integrations/supabase/client";

export class EmailSendingService {
  /**
   * Send email via edge function
   */
  async sendEmail(
    recipientEmail: string,
    emailAccount: any,
    subject: string,
    html: string,
    logId?: string
  ) {
    // Extract email account data from the nested array
    const account = Array.isArray(emailAccount) ? emailAccount[0] : emailAccount;
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        from: account.from_email,
        fromName: account.from_name,
        subject: subject,
        html: html,
        logId: logId
      }
    });

    if (error) {
      throw error;
    }

    return data;
  }
}

export const emailSendingService = new EmailSendingService();
