
import { supabase } from "@/integrations/supabase/client";
import { emailAuthService } from "./EmailAuthService";

export class EmailLoggingService {
  /**
   * Log email attempt with enhanced security
   */
  async logEmailAttempt(
    templateId: string,
    recipientEmail: string,
    subject: string,
    renderedHtml: string,
    variablesUsed: Record<string, string>,
    accountType: "robot" | "team" | "info" | "notifications"
  ) {
    try {
      // RLS policies will automatically enforce access control for logging
      const { data: logData, error: logError } = await supabase
        .from('email_send_logs')
        .insert({
          template_id: templateId,
          recipient_email: recipientEmail,
          subject: subject,
          rendered_html: renderedHtml,
          variables_used: variablesUsed,
          account_type: accountType,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('Failed to log email attempt:', logError);
      }

      return logData;
    } catch (error) {
      console.error('Error in logEmailAttempt:', error);
      return null;
    }
  }

  /**
   * Get email send logs with pagination and enhanced security
   */
  async getEmailLogs(page: number = 1, limit: number = 50) {
    try {
      // Check admin access first using the new validation function
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to view email logs');
      }

      const offset = (page - 1) * limit;
      
      // RLS policies will now automatically enforce access control
      const { data, error, count } = await supabase
        .from('email_send_logs')
        .select(`
          *,
          email_templates!inner(name, template_key)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        logs: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error: any) {
      console.error('Error loading email logs:', error);
      throw error;
    }
  }

  /**
   * Update email log status
   */
  async updateEmailLogStatus(logId: string, status: string, errorMessage?: string) {
    try {
      const { error } = await supabase
        .from('email_send_logs')
        .update({
          status,
          error_message: errorMessage,
          sent_at: status === 'sent' ? new Date().toISOString() : null
        })
        .eq('id', logId);

      if (error) {
        console.error('Failed to update email log status:', error);
      }
    } catch (error) {
      console.error('Error in updateEmailLogStatus:', error);
    }
  }
}

export const emailLoggingService = new EmailLoggingService();
