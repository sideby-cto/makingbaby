import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Eye, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  variables: any; // JSONB field from database
  status: string;
  account_type: string;
  created_at: string;
  updated_at: string;
}

interface EmailLog {
  id: string;
  template_key?: string;
  recipient_email: string;
  subject: string;
  status: string;
  error_message?: string;
  created_at: string;
}

export function EmailManagementView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('email_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Load recent email logs
      const { data: logsData, error: logsError } = await supabase
        .from('email_send_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setEmailLogs(logsData || []);

    } catch (error) {
      console.error('Error loading email data:', error);
      toast({
        title: "Error",
        description: "Failed to load email data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = async (template: EmailTemplate) => {
    try {
      // Handle JSONB variables field
      const templateVariables = Array.isArray(template.variables) 
        ? template.variables 
        : template.variables ? JSON.parse(template.variables) : [];
        
      const variables = templateVariables.reduce((acc, variable) => {
        acc[variable.name] = testVariables[variable.name] || `[${variable.name}]`;
        return acc;
      }, {} as Record<string, string>);

      const { data, error } = await supabase.functions.invoke('render-email-template', {
        body: {
          templateKey: template.template_key,
          variables
        }
      });

      if (error) throw error;

      setPreviewHtml(data.body_html);
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Error previewing template:', error);
      toast({
        title: "Error",
        description: "Failed to preview template.",
        variant: "destructive",
      });
    }
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Handle JSONB variables field
      const templateVariables = Array.isArray(template.variables) 
        ? template.variables 
        : template.variables ? JSON.parse(template.variables) : [];
        
      const variables = templateVariables.reduce((acc, variable) => {
        acc[variable.name] = testVariables[variable.name] || `[${variable.name}]`;
        return acc;
      }, {} as Record<string, string>);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          templateKey: template.template_key,
          to: testEmail,
          variables
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Test email sent to ${testEmail}`,
      });

      // Refresh logs
      loadData();
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email.",
        variant: "destructive",
      });
    }
  };

  const updateTestVariable = (variableName: string, value: string) => {
    setTestVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Manage email templates and monitor delivery
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{template.name}</span>
                    <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Key: {template.template_key}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Subject:</strong> {template.subject}</p>
                    <p className="text-sm"><strong>Variables:</strong> {
                      Array.isArray(template.variables) 
                        ? template.variables.length 
                        : template.variables ? JSON.parse(template.variables).length : 0
                    }</p>
                    <p className="text-sm"><strong>Account:</strong> {template.account_type}</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                {selectedTemplate && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Template Variables</h3>
                    {(() => {
                      const templateVariables = Array.isArray(selectedTemplate.variables) 
                        ? selectedTemplate.variables 
                        : selectedTemplate.variables ? JSON.parse(selectedTemplate.variables) : [];
                      
                      return templateVariables.map((variable) => (
                        <div key={variable.name}>
                          <Label htmlFor={variable.name}>{variable.name}</Label>
                          <Input
                            id={variable.name}
                            value={testVariables[variable.name] || ''}
                            onChange={(e) => updateTestVariable(variable.name, e.target.value)}
                            placeholder={variable.description || variable.name}
                          />
                        </div>
                      ));
                    })()}
                    <Button
                      onClick={() => handleSendTestEmail(selectedTemplate)}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {previewHtml ? (
                  <div className="border rounded-lg p-4 bg-white max-h-96 overflow-auto">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-64 border-0"
                      title="Email Preview"
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a template and click Preview to see the rendered email
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emailLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          To: {log.recipient_email} • Template: {log.template_key}
                        </p>
                        {log.error_message && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {log.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {emailLogs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No email logs found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}