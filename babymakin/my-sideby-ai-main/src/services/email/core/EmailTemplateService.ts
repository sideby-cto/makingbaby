
import { supabase } from "@/integrations/supabase/client";
import { EmailTemplate } from "../centralizedEmailService";
import { emailAuthService } from "./EmailAuthService";

export class EmailTemplateService {
  /**
   * Get all email templates with enhanced security
   */
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to view email templates');
      }

      // RLS policies will now automatically enforce access control
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading email templates:', error);
        throw error;
      }

      // Convert the response to match our interface
      return (data || []).map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? template.variables.filter((v): v is string => typeof v === 'string')
          : []
      }));
    } catch (error: any) {
      console.error('Error loading email templates:', error);
      throw error;
    }
  }

  /**
   * Create or update email template with enhanced security
   */
  async saveEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to save email templates');
      }

      // Log the operation for audit trail
      await emailAuthService.logSecurityOperation(
        template.id ? 'UPDATE' : 'CREATE',
        'email_templates',
        template.id,
        { templateKey: template.template_key, name: template.name }
      );

      if (template.id) {
        // Update existing template - RLS will enforce permissions
        const { data, error } = await supabase
          .from('email_templates')
          .update({
            name: template.name,
            subject: template.subject,
            template_key: template.template_key,
            description: template.description,
            header_html: template.header_html,
            body_html: template.body_html,
            footer_html: template.footer_html,
            header_template_id: template.header_template_id,
            footer_template_id: template.footer_template_id,
            variables: template.variables,
            account_type: template.account_type,
            status: template.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return {
          ...data,
          variables: Array.isArray(data.variables) 
            ? data.variables.filter((v): v is string => typeof v === 'string')
            : []
        };
      } else {
        // Create new template - get current user ID safely
        const currentUserId = await emailAuthService.getCurrentUserId();
        if (!currentUserId) {
          throw new Error('Authentication required to create templates');
        }
        
        const { data, error } = await supabase
          .from('email_templates')
          .insert({
            name: template.name,
            subject: template.subject,
            template_key: template.template_key,
            description: template.description,
            header_html: template.header_html,
            body_html: template.body_html,
            footer_html: template.footer_html,
            header_template_id: template.header_template_id,
            footer_template_id: template.footer_template_id,
            variables: template.variables,
            account_type: template.account_type,
            status: template.status || 'draft',
            created_by: currentUserId
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return {
          ...data,
          variables: Array.isArray(data.variables) 
            ? data.variables.filter((v): v is string => typeof v === 'string')
            : []
        };
      }
    } catch (error: any) {
      console.error('Error saving email template:', error);
      throw error;
    }
  }

  /**
   * Delete email template with enhanced security
   */
  async deleteEmailTemplate(templateId: string): Promise<void> {
    try {
      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to delete email templates');
      }

      // Log the operation for audit trail
      await emailAuthService.logSecurityOperation('DELETE', 'email_templates', templateId);

      // RLS will enforce permissions
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  }

  /**
   * Get template with account info and header/footer templates
   */
  async getTemplateWithDetails(templateKey: string) {
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select(`
        id,
        name,
        subject,
        body_html,
        variables,
        account_type,
        header_template_id,
        footer_template_id,
        email_accounts!inner(from_email, from_name),
        header_template:email_header_footer_templates!header_template_id(html_content),
        footer_template:email_header_footer_templates!footer_template_id(html_content)
      `)
      .eq('template_key', templateKey)
      .eq('status', 'active')
      .single();

    if (templateError || !templateData) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    return templateData;
  }
}

export const emailTemplateService = new EmailTemplateService();
