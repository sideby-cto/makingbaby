
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { emailAuthService } from '@/services/email/core/EmailAuthService';

export interface HeaderFooterTemplate {
  id: string;
  name: string;
  type: 'header' | 'footer';
  html_content: string;
  is_default: boolean;
  account_type: 'robot' | 'team' | 'info' | 'notifications';
  created_at: string;
  updated_at: string;
}

export function useHeaderFooterTemplates() {
  const [templates, setTemplates] = useState<HeaderFooterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to manage header/footer templates');
      }

      console.log('Loading header/footer templates...');
      
      // Since RLS is temporarily disabled, this should work
      const { data, error } = await supabase
        .from('email_header_footer_templates')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading header/footer templates:', error);
        throw error;
      }

      console.log('Header/footer templates loaded:', data?.length || 0);
      // Type assertion to ensure the data matches our interface
      setTemplates((data || []) as HeaderFooterTemplate[]);

    } catch (error: any) {
      console.error('Error in loadTemplates:', error);
      setError(error.message || 'Failed to load header/footer templates');
      toast({
        title: 'Error loading templates',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: Partial<HeaderFooterTemplate>) => {
    try {
      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to save header/footer templates');
      }

      console.log('Saving header/footer template:', template);

      if (template.id) {
        // Update existing template
        const { data, error } = await supabase
          .from('email_header_footer_templates')
          .update({
            name: template.name,
            type: template.type,
            html_content: template.html_content,
            is_default: template.is_default,
            account_type: template.account_type || 'robot',
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
          .select()
          .single();

        if (error) throw error;

        setTemplates(prevTemplates =>
          prevTemplates.map(t => t.id === template.id ? data as HeaderFooterTemplate : t)
        );

        toast({
          title: 'Template updated',
          description: 'Header/footer template has been updated successfully',
        });
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('email_header_footer_templates')
          .insert({
            name: template.name,
            type: template.type,
            html_content: template.html_content,
            is_default: template.is_default || false,
            account_type: template.account_type || 'robot'
          })
          .select()
          .single();

        if (error) throw error;

        setTemplates(prevTemplates => [...prevTemplates, data as HeaderFooterTemplate]);

        toast({
          title: 'Template created',
          description: 'Header/footer template has been created successfully',
        });
      }

    } catch (error: any) {
      console.error('Error saving header/footer template:', error);
      toast({
        title: 'Error saving template',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to delete header/footer templates');
      }

      console.log('Deleting header/footer template:', templateId);

      const { error } = await supabase
        .from('email_header_footer_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prevTemplates =>
        prevTemplates.filter(t => t.id !== templateId)
      );

      toast({
        title: 'Template deleted',
        description: 'Header/footer template has been deleted successfully',
      });

    } catch (error: any) {
      console.error('Error deleting header/footer template:', error);
      toast({
        title: 'Error deleting template',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    deleteTemplate,
  };
}
