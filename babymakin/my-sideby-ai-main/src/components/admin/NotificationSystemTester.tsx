
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TestEmailButton } from "@/components/upduo/TestEmailButton";
import { useManualDigestTrigger } from '@/hooks/useManualDigestTrigger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from "lucide-react";

export const NotificationSystemTester = ({ onTriggerComplete }: { onTriggerComplete?: () => Promise<void> }) => {
  const [activeTab, setActiveTab] = useState('manual-trigger');
  const { isLoading, triggerDigestManually } = useManualDigestTrigger();

  const handleTriggerClick = async () => {
    await triggerDigestManually();
    if (onTriggerComplete) {
      await onTriggerComplete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification System Tester</CardTitle>
        <CardDescription>
          Test the notification system with these utilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual-trigger">Manual Digest Trigger</TabsTrigger>
            <TabsTrigger value="email-test">Email Tester</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual-trigger" className="space-y-4 pt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Trigger the notification digest processing manually. This will immediately process any pending notifications.
              </p>
              <Button 
                onClick={handleTriggerClick} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Processing Notifications...
                  </>
                ) : (
                  'Process Notifications Now'
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="email-test" className="space-y-4 pt-4">
            <TestEmailButton />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Notification logs will refresh automatically after processing completes.
      </CardFooter>
    </Card>
  );
};
