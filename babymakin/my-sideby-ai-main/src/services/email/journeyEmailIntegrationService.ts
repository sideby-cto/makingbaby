
import { supabase } from "@/integrations/supabase/client";
import { centralizedEmailService, EmailTemplate } from "./centralizedEmailService";

export interface JourneyTemplate {
  id: string;
  stage: string;
  reminder_type: string;
  email_template_id?: string;
  template_variables?: string;
  active: boolean;
  bypass_template: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for migration
  subject?: string;
  content?: string;
  cta_text?: string;
  cta_url?: string;
}

export interface JourneyTemplateWithCentralized extends JourneyTemplate {
  email_template?: EmailTemplate;
}

class JourneyEmailIntegrationService {
  /**
   * Get all journey templates with their associated centralized email templates
   */
  async getJourneyTemplatesWithEmailTemplates(): Promise<JourneyTemplateWithCentralized[]> {
    const { data, error } = await supabase
      .from('journey_reminder_templates')
      .select(`
        *,
        email_template:email_templates(*)
      `)
      .order('stage')
      .order('reminder_type');

    if (error) {
      throw error;
    }

    // Handle the case where email_template might be null or an error object
    return (data || []).map(template => {
      const emailTemplate = template.email_template;
      
      // More explicit null check that TypeScript can understand
      const isValidEmailTemplate = emailTemplate !== null && 
                                  emailTemplate !== undefined &&
                                  typeof emailTemplate === 'object' && 
                                  !Array.isArray(emailTemplate) &&
                                  !('error' in emailTemplate);
      
      return {
        ...template,
        email_template: isValidEmailTemplate ? emailTemplate as EmailTemplate : undefined
      };
    });
  }

  /**
   * Get available email templates for journey notifications
   */
  async getAvailableEmailTemplates(): Promise<EmailTemplate[]> {
    return centralizedEmailService.getEmailTemplates();
  }

  /**
   * Create or update a journey template with centralized email template
   */
  async saveJourneyTemplate(template: Partial<JourneyTemplate>): Promise<JourneyTemplate> {
    // For now, we'll include both old and new fields to support migration
    const templateData: any = {
      stage: template.stage,
      reminder_type: template.reminder_type,
      active: template.active !== undefined ? template.active : true,
      bypass_template: template.bypass_template || false,
    };

    // Add new fields if they exist
    if (template.email_template_id) {
      templateData.email_template_id = template.email_template_id;
    }
    if (template.template_variables !== undefined) {
      templateData.template_variables = template.template_variables;
    }

    // Add legacy fields if they exist (for backward compatibility during migration)
    if (template.subject) {
      templateData.subject = template.subject;
    }
    if (template.content) {
      templateData.content = template.content;
    }
    if (template.cta_text) {
      templateData.cta_text = template.cta_text;
    }
    if (template.cta_url) {
      templateData.cta_url = template.cta_url;
    }

    if (template.id) {
      // Update existing template
      const { data, error } = await supabase
        .from('journey_reminder_templates')
        .update({
          ...templateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new template - ensure required legacy fields for now
      if (!templateData.subject) templateData.subject = 'Default Subject';
      if (!templateData.content) templateData.content = 'Default Content';
      
      const { data, error } = await supabase
        .from('journey_reminder_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  /**
   * Check if template has been used in notifications
   */
  async checkTemplateUsage(templateId: string): Promise<{ hasUsage: boolean; logCount: number }> {
    const { data, error, count } = await supabase
      .from('journey_reminder_logs')
      .select('id', { count: 'exact' })
      .eq('template_id', templateId);

    if (error) throw error;

    return {
      hasUsage: (count || 0) > 0,
      logCount: count || 0
    };
  }

  /**
   * Delete a journey template with options for handling dependencies
   */
  async deleteJourneyTemplate(
    templateId: string, 
    options: { 
      strategy: 'cascade' | 'obfuscate' | 'force' 
    } = { strategy: 'force' }
  ): Promise<void> {
    const { strategy } = options;

    if (strategy === 'cascade') {
      // First delete all related logs
      const { error: logsError } = await supabase
        .from('journey_reminder_logs')
        .delete()
        .eq('template_id', templateId);

      if (logsError) throw logsError;
    } else if (strategy === 'obfuscate') {
      // Nullify the template_id in related logs instead of deleting them
      const { error: updateError } = await supabase
        .from('journey_reminder_logs')
        .update({ template_id: null })
        .eq('template_id', templateId);

      if (updateError) throw updateError;
    }

    // Now delete the template
    const { error } = await supabase
      .from('journey_reminder_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  }

  /**
   * Preview a journey template with variables
   */
  async previewJourneyTemplate(
    centralizedTemplateId: string, 
    variables: string,
    sampleData?: Record<string, string>
  ): Promise<{ subject: string; html: string }> {
    // Get the centralized template
    const templates = await this.getAvailableEmailTemplates();
    const template = templates.find(t => t.id === centralizedTemplateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Parse variables from comma-separated string
    const variableNames = variables.split(',').map(v => v.trim()).filter(v => v);
    
    // Create sample variable values for preview
    const variableValues = variableNames.map(name => ({
      name,
      value: sampleData?.[name] || `{${name}}`
    }));

    // Use centralized email service to send templated email for preview
    const result = await centralizedEmailService.sendTemplatedEmail({
      templateKey: template.template_key,
      recipientEmail: 'preview@example.com',
      variables: variableValues,
      recipientName: 'Preview User'
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate preview');
    }

    return {
      subject: template.subject,
      html: template.body_html
    };
  }

  /**
   * Migrate legacy template to centralized system
   */
  async migrateLegacyTemplate(journeyTemplateId: string): Promise<void> {
    // Get the journey template
    const { data: journeyTemplate, error } = await supabase
      .from('journey_reminder_templates')
      .select('*')
      .eq('id', journeyTemplateId)
      .single();

    if (error || !journeyTemplate) {
      throw new Error('Journey template not found');
    }

    // Check if it has legacy fields to migrate
    if (!journeyTemplate.subject || !journeyTemplate.content) {
      throw new Error('No legacy content to migrate');
    }

    // Create a new centralized email template
    const centralizedTemplate = await centralizedEmailService.saveEmailTemplate({
      name: `Journey ${journeyTemplate.stage} - ${journeyTemplate.reminder_type}`,
      subject: journeyTemplate.subject,
      template_key: `journey_${journeyTemplate.stage}_${journeyTemplate.reminder_type}`,
      body_html: `
        <p>${journeyTemplate.content}</p>
        ${journeyTemplate.cta_text && journeyTemplate.cta_url ? 
          `<p style="text-align: center; margin: 20px 0;">
            <a href="${journeyTemplate.cta_url}" style="background-color: #9b87f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              ${journeyTemplate.cta_text}
            </a>
          </p>` : ''
        }
      `,
      variables: ['recipient_name', 'current_year'],
      account_type: 'notifications',
      status: 'active'
    });

    // Update the journey template to reference the centralized template
    await this.saveJourneyTemplate({
      ...journeyTemplate,
      email_template_id: centralizedTemplate.id,
      template_variables: 'recipient_name,current_year'
    });
  }
}

export const journeyEmailIntegrationService = new JourneyEmailIntegrationService();
