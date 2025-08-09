
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { centralizedEmailService, EmailTemplate } from '@/services/email/centralizedEmailService';
import { Send, AlertCircle } from 'lucide-react';

export function EmailTestForm() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const data = await centralizedEmailService.getEmailTemplates();
      setTemplates(data.filter(t => t.status === 'active'));
    } catch (error: any) {
      console.error('Error loading templates:', error);
      setError(error.message || 'Failed to load email templates');
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = templates.find(t => t.template_key === templateKey);
    if (template) {
      const newVariables: Record<string, string> = {};
      template.variables.forEach(variable => {
        newVariables[variable] = '';
      });
      setVariables(newVariables);
    }
  };

  const handleSendTestEmail = async () => {
    if (!selectedTemplate || !recipientEmail) {
      toast({
        title: "Missing information",
        description: "Please select a template and enter recipient email",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const variableArray = Object.entries(variables).map(([name, value]) => ({
        name,
        value
      }));

      const result = await centralizedEmailService.sendTemplatedEmail({
        templateKey: selectedTemplate,
        recipientEmail,
        recipientName,
        variables: variableArray
      });

      if (result.success) {
        toast({
          title: "Test email sent",
          description: `Test email sent successfully to ${recipientEmail}`
        });
        
        // Reset form
        setSelectedTemplate('');
        setRecipientEmail('');
        setRecipientName('');
        setVariables({});
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error sending test email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.template_key === selectedTemplate);

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an email template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.template_key} value={template.template_key}>
                    {template.name} ({template.template_key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Email</label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Name</label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Test User"
              />
            </div>
          </div>

          {selectedTemplateData && selectedTemplateData.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Template Variables</label>
              <div className="space-y-2">
                {selectedTemplateData.variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-xs text-muted-foreground mb-1">
                      {variable}
                    </label>
                    <Input
                      value={variables[variable] || ''}
                      onChange={(e) => setVariables(prev => ({
                        ...prev,
                        [variable]: e.target.value
                      }))}
                      placeholder={`Enter value for ${variable}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleSendTestEmail} 
            disabled={loading || !selectedTemplate || !recipientEmail}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Test Email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
