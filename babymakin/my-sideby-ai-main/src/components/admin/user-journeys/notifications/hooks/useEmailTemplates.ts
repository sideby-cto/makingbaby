
import { useState, useEffect, useCallback } from 'react';
import { centralizedEmailService } from '@/services/email/centralizedEmailService';
import { useToast } from '@/hooks/use-toast';

export interface EmailTemplateOption {
  id: string;
  name: string;
  template_key: string;
  subject: string;
  status: string;
}

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadEmailTemplates = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading email templates for notification template selector...');
      
      const data = await centralizedEmailService.getEmailTemplates();
      console.log('Raw email templates data received:', data);
      
      // Filter only active templates and map to our interface
      const activeTemplates = data
        .filter(template => {
          console.log(`Template ${template.name}: status = "${template.status}"`);
          return template.status === 'active';
        })
        .map(template => ({
          id: template.id,
          name: template.name,
          template_key: template.template_key,
          subject: template.subject,
          status: template.status
        }));
      
      console.log('Filtered active templates:', activeTemplates);
      console.log('Email templates loaded for selector:', activeTemplates.length);
      setTemplates(activeTemplates);
    } catch (error: any) {
      console.error('Error loading email templates:', error);
      toast({
        title: 'Error loading email templates',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []); // Remove toast from dependencies to prevent infinite loop

  // Load templates when the component mounts - only once
  useEffect(() => {
    console.log('useEmailTemplates mount effect triggered');
    loadEmailTemplates();
  }, []); // Remove loadEmailTemplates from dependencies

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.template_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('useEmailTemplates returning:', {
    allTemplates: templates.length,
    filteredTemplates: filteredTemplates.length,
    loading,
    searchTerm
  });

  return {
    templates: filteredTemplates,
    loading,
    searchTerm,
    setSearchTerm,
    refreshTemplates: loadEmailTemplates
  };
}
