
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { logNotificationDelivery } from '@/services/notifications/notificationLogUtils';

export function useManualDigestTrigger() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to directly call the SQL function that triggers the cron job
  const triggerDatabaseDigestFunction = async () => {
    try {
      // First log the trigger attempt
      const dummyNotificationId = crypto.randomUUID();
      await logNotificationDelivery({
        notificationId: dummyNotificationId,
        sourceTable: 'system',
        channel: 'cron_trigger',
        success: true
      });
      
      const { data, error } = await supabase.rpc('trigger_notification_digest');
      
      if (error) {
        console.error('Error calling trigger_notification_digest RPC:', error);
        
        // Log failure
        await logNotificationDelivery({
          notificationId: dummyNotificationId,
          sourceTable: 'system',
          channel: 'cron_trigger',
          success: false,
          error: error.message
        });
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in triggerDatabaseDigestFunction:', error);
      throw error;
    }
  };

  const triggerDigestManually = async () => {
    setIsLoading(true);
    try {
      // Call the database function directly
      const dbFunctionResult = await triggerDatabaseDigestFunction();
      console.log('Database function trigger result:', dbFunctionResult);
      
      toast({
        title: 'Digest processing triggered',
        description: 'The notification digest process has started. Check logs for results.',
      });
      
      return dbFunctionResult;
    } catch (dbError) {
      console.error('Error triggering via database function:', dbError);
      
      try {
        // Log the fallback attempt
        const dummyNotificationId = crypto.randomUUID();
        await logNotificationDelivery({
          notificationId: dummyNotificationId,
          sourceTable: 'system',
          channel: 'edge_function',
          success: true
        });
        
        // Fall back to directly calling the edge function
        const { data: directResult, error: directError } = await supabase.functions.invoke(
          'process-notification-digests',
          {
            body: { manualTrigger: true, adminTriggered: true }
          }
        );

        if (directError) {
          console.error('Error directly invoking process-notification-digests:', directError);
          
          // Log failure
          await logNotificationDelivery({
            notificationId: dummyNotificationId,
            sourceTable: 'system',
            channel: 'edge_function',
            success: false,
            error: directError.message
          });
          
          throw directError;
        }
        
        toast({
          title: 'Digest processing triggered via edge function',
          description: 'The notification digest was triggered directly via the edge function.',
        });
        
        return directResult;
      } catch (edgeFunctionError) {
        console.error('Error directly invoking edge function:', edgeFunctionError);
        
        // If both methods fail, show error
        toast({
          title: 'Error',
          description: `Failed to trigger notification digest: ${edgeFunctionError.message}`,
          variant: 'destructive',
        });
        throw edgeFunctionError;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    triggerDigestManually,
    triggerDatabaseDigestFunction,
    isLoading
  };
}
