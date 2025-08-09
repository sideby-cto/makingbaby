
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { logNotificationDelivery } from '@/services/notifications/notificationLogUtils';

export const TestEmailButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    setIsLoading(true);
    try {
      // Get current user's email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user?.email) {
        toast({
          title: 'Error',
          description: 'Unable to get user email. Please make sure you are logged in.',
          variant: 'destructive',
        });
        return;
      }

      const dummyNotificationId = crypto.randomUUID();
      
      // Log the test attempt
      await logNotificationDelivery({
        notificationId: dummyNotificationId,
        sourceTable: 'system',
        channel: 'email',
        success: true,
        error: 'Test email requested'
      });
      
      // Send test email with user's email
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { 
          email: user.email,
          source: 'admin-panel' 
        }
      });

      if (error) {
        console.error('Error sending test email:', error);
        
        // Log failure
        await logNotificationDelivery({
          notificationId: dummyNotificationId,
          sourceTable: 'system',
          channel: 'email',
          success: false,
          error: `Test email failed: ${error.message}`
        });
        
        toast({
          title: 'Error',
          description: `Failed to send test email: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Check if the response indicates success
      if (data && !data.success) {
        console.error('Test email function returned error:', data);
        
        // Log failure
        await logNotificationDelivery({
          notificationId: dummyNotificationId,
          sourceTable: 'system',
          channel: 'email',
          success: false,
          error: `Test email failed: ${data.error || 'Unknown error'}`
        });
        
        toast({
          title: 'Error',
          description: `Failed to send test email: ${data.error || 'Unknown error'}`,
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Test email sent',
        description: `A test email has been sent to ${user.email}. Please check your inbox.`,
      });
    } catch (error) {
      console.error('Error in handleTestEmail:', error);
      
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while sending the test email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Send a test email to your account to verify email delivery is working.
      </p>
      <Button 
        onClick={handleTestEmail} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Sending Test Email...
          </>
        ) : (
          'Send Test Email'
        )}
      </Button>
    </div>
  );
};
