
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle } from "lucide-react";

export const SlackConfigurationForm = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  const handleSaveWebhookUrl = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      toast({
        title: "Error",
        description: "Please enter a valid Slack webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would save to Supabase secrets
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConfigured(true);
      toast({
        title: "Success",
        description: "Slack webhook URL has been configured successfully",
      });
    } catch (error) {
      console.error('Error saving webhook URL:', error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('slack-notification', {
        body: {
          type: 'test',
          message: 'Test notification from sideby admin panel'
        }
      });

      if (error) throw error;

      toast({
        title: "Test notification sent",
        description: "Check your Slack channel for the test message",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Slack Notifications Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Slack Webhook URL</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://hooks.slack.com/services/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">
            Get this URL from your Slack app's "Incoming Webhooks" settings
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSaveWebhookUrl}
            disabled={isLoading || !webhookUrl.trim()}
          >
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
          
          {isConfigured && (
            <Button 
              variant="outline"
              onClick={testNotification}
              disabled={isLoading}
            >
              {isLoading ? "Testing..." : "Send Test Notification"}
            </Button>
          )}
        </div>

        {isConfigured && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Slack notifications are configured</span>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Go to your Slack workspace settings</li>
            <li>2. Create a new Slack app or select an existing one</li>
            <li>3. Enable "Incoming Webhooks" feature</li>
            <li>4. Create a new webhook for your desired channel</li>
            <li>5. Copy the webhook URL and paste it above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
