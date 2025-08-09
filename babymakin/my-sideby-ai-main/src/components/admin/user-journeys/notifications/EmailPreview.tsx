
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailPreviewProps {
  templateId: string;
  onBack?: () => void; // Optional back handler
}

export function EmailPreview({ templateId, onBack }: EmailPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (templateId) {
      loadTemplateAndGeneratePreview(templateId);
    }
  }, [templateId]);

  const loadTemplateAndGeneratePreview = async (id: string) => {
    setLoading(true);
    try {
      // Load template
      const { data, error } = await supabase
        .from("journey_reminder_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setTemplate(data);

      // Generate preview HTML
      generatePreview(data);
    } catch (error) {
      console.error("Error loading template:", error);
      toast({
        title: "Error",
        description: "Failed to load email template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = (template: any) => {
    // Sample user data for preview
    const userData = {
      first_name: "Jane",
      last_name: "Educator"
    };

    // Replace template variables
    let content = template.content;
    content = content.replace(/{first_name}/g, userData.first_name);
    content = content.replace(/{last_name}/g, userData.last_name);

    // Generate HTML preview
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; color: #333;">
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 5px 5px 0 0;">
          <img src="https://sideby.ai/logo.png" alt="sideby" style="height: 30px; margin-bottom: 10px;" />
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          <h2 style="color: #333; margin-top: 0;">${template.subject}</h2>
          <div style="line-height: 1.6; margin-bottom: 20px;">
            ${content.replace(/\n/g, '<br/>')}
          </div>
          ${template.cta_text && template.cta_url ? `
            <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
              <a href="${template.cta_url}" style="display: inline-block; padding: 10px 20px; background-color: #FF5733; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">${template.cta_text}</a>
            </div>
          ` : ''}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>This email was sent by sideby. © 2025 sideby, Inc.</p>
            <p>If you have questions or need assistance, please contact support@sideby.ai.</p>
          </div>
        </div>
      </div>
    `;
    
    setPreviewHtml(html);
  };

  const refreshPreview = () => {
    if (template) {
      generatePreview(template);
      toast({
        title: "Preview Refreshed",
        description: "Email preview has been updated"
      });
    }
  };

  // Use the provided back handler or default to history.back()
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      history.back();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>
              Email Preview
              {template && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({template.stage} - {template.reminder_type})
                </span>
              )}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={refreshPreview}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Preview
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : template ? (
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Subject: {template.subject}</h3>
                <p className="text-sm text-muted-foreground">To: jane.educator@example.com</p>
              </div>
              <div className="h-[500px] overflow-auto border-t">
                <iframe
                  title="Email Preview"
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Could not load the email template. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t">
        <span className="text-sm text-muted-foreground">
          This is a preview of how the email will appear to recipients.
        </span>
        {template && template.cta_url && (
          <Button variant="outline" size="sm" onClick={() => window.open(template.cta_url, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Test Link
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
