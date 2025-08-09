
import { supabase } from "@/integrations/supabase/client";
import { emailAuthService } from "./core/EmailAuthService";
import { emailTemplateService } from "./core/EmailTemplateService";
import { emailAccountService } from "./core/EmailAccountService";
import { emailRenderingService } from "./core/EmailRenderingService";
import { emailLoggingService } from "./core/EmailLoggingService";
import { emailSendingService } from "./core/EmailSendingService";

export interface EmailVariable {
  name: string;
  value: string;
}

export interface SendEmailOptions {
  templateKey: string;
  recipientEmail: string;
  variables: EmailVariable[];
  recipientName?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template_key: string;
  description?: string;
  header_html?: string;
  body_html: string;
  footer_html?: string;
  header_template_id?: string;
  footer_template_id?: string;
  variables: string[];
  account_type: 'robot' | 'team' | 'info' | 'notifications';
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface EmailAccount {
  id: string;
  account_type: 'robot' | 'team' | 'info' | 'notifications';
  from_email: string;
  from_name: string;
  is_default: boolean;
}

class CentralizedEmailService {
  /**
   * Check if current user is admin - delegated to auth service
   */
  private async isCurrentUserAdmin(): Promise<boolean> {
    return emailAuthService.isCurrentUserAdmin();
  }

  /**
   * Get current user ID safely - delegated to auth service
   */
  private async getCurrentUserId(): Promise<string | null> {
    return emailAuthService.getCurrentUserId();
  }

  /**
   * Send an email using a template
   */
  async sendTemplatedEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      // Check admin access first
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to send templated emails');
      }

      // Get template with account info and header/footer templates
      const templateData = await emailTemplateService.getTemplateWithDetails(options.templateKey);

      // Prepare variables object for easy replacement
      const variablesMap = emailRenderingService.prepareVariablesMap(options.variables, options.recipientName);

      // Render the email content
      const renderedSubject = emailRenderingService.replaceVariables(templateData.subject, variablesMap);
      const finalHtml = emailRenderingService.renderEmailContent(templateData, variablesMap);

      // Log the email attempt
      const logData = await emailLoggingService.logEmailAttempt(
        templateData.id,
        options.recipientEmail,
        renderedSubject,
        finalHtml,
        variablesMap,
        templateData.account_type
      );

      // Send the email
      await emailSendingService.sendEmail(
        options.recipientEmail,
        templateData.email_accounts,
        renderedSubject,
        finalHtml,
        logData?.id
      );

      return { success: true };
    } catch (error: any) {
      console.error('Failed to send templated email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Replace variables in text using {{variable_name}} syntax - delegated to rendering service
   */
  private replaceVariables(text: string, variables: Record<string, string>): string {
    return emailRenderingService.replaceVariables(text, variables);
  }

  /**
   * Get all email templates - delegated to template service
   */
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return emailTemplateService.getEmailTemplates();
  }

  /**
   * Get all email accounts - delegated to account service
   */
  async getEmailAccounts(): Promise<EmailAccount[]> {
    return emailAccountService.getEmailAccounts();
  }

  /**
   * Create or update email template - delegated to template service
   */
  async saveEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return emailTemplateService.saveEmailTemplate(template);
  }

  /**
   * Delete email template - delegated to template service
   */
  async deleteEmailTemplate(templateId: string): Promise<void> {
    return emailTemplateService.deleteEmailTemplate(templateId);
  }

  /**
   * Get email send logs with pagination - delegated to logging service
   */
  async getEmailLogs(page: number = 1, limit: number = 50) {
    return emailLoggingService.getEmailLogs(page, limit);
  }
}

export const centralizedEmailService = new CentralizedEmailService();
