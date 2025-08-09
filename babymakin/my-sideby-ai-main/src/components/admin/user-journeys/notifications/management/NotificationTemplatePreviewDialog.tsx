
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, X, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NotificationTemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
}

export function NotificationTemplatePreviewDialog({
  open,
  onOpenChange,
  templateId
}: NotificationTemplatePreviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (open && templateId) {
      loadTemplateAndGeneratePreview();
    }
  }, [open, templateId]);

  const loadTemplateAndGeneratePreview = async () => {
    setLoading(true);
    try {
      // Load template
      const { data, error } = await supabase
        .from("journey_reminder_templates")
        .select("*")
        .eq("id", templateId)
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
      first_name: "Preview User",
      last_name: "Educator"
    };

    // Replace template variables
    let content = template.content;
    content = content.replace(/{first_name}/g, userData.first_name);
    content = content.replace(/{last_name}/g, userData.last_name);

    // Generate HTML preview
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; color: #333; background: white;">
        <div style="background-color: #1e40af; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">sideby</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Your Learning Community Updates</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #333; margin-top: 0; margin-bottom: 16px;">${template.subject}</h2>
          <div style="line-height: 1.6; margin-bottom: 24px; color: #475569;">
            ${content.replace(/\n/g, '<br/>')}
          </div>
          ${template.cta_text && template.cta_url ? `
            <div style="text-align: center; margin-top: 32px; margin-bottom: 24px;">
              <a href="${template.cta_url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">${template.cta_text}</a>
            </div>
          ` : ''}
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
              Visit your <a href="https://my.sideby.ai/dashboard" style="color: #3b82f6; text-decoration: none;">sideby dashboard</a> to see all your updates and continue your learning journey.
            </p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} sideby. All rights reserved.</p>
          <p style="margin: 0;">You're receiving this because you're part of the sideby community.</p>
        </div>
      </div>
    `;
    
    setPreviewHtml(html);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-xl font-semibold">Email Template Preview</span>
                {template && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {template.stage?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.reminder_type}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {template?.cta_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(template.cta_url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Test Link
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Separator className="flex-shrink-0" />
        
        <div className="flex-1 overflow-hidden min-h-0">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-sm text-muted-foreground">Loading email template...</p>
            </div>
          ) : template ? (
            <div className="h-full flex flex-col bg-gray-50 rounded-lg overflow-hidden">
              <div className="flex-shrink-0 bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Subject: {template.subject}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      To: preview.user@example.com
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Preview Mode</p>
                    <p className="text-xs text-gray-500">Sample data used</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <iframe
                    title="Email Preview"
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full">
              <Mail className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-muted-foreground text-center">
                Unable to load the email template.
                <br />
                Please try again or contact support if the issue persists.
              </p>
            </div>
          )}
        </div>
        
        <Separator className="flex-shrink-0" />
        
        <div className="flex-shrink-0 flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            This preview shows how the email will appear to recipients with sample data.
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
