import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const NotificationTestPanel = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchId, setMatchId] = useState('');
  const [user1Id, setUser1Id] = useState('');
  const [user2Id, setUser2Id] = useState('');
  const [rationale, setRationale] = useState('Test match notification');

  const handleTestMatchNotification = async () => {
    if (!matchId || !user1Id || !user2Id) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-match-notification', {
        body: {
          matchId,
          user1Id,
          user2Id,
          rationale
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Test Notification Sent',
        description: `Successfully sent match notification for match ${matchId}`,
      });

      console.log('Test notification result:', data);
    } catch (error: any) {
      console.error('Test notification failed:', error);
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to send test notification',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessSmsNotifications = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-sms-notifications');

      if (error) {
        throw error;
      }

      toast({
        title: 'SMS Processing Complete',
        description: `Processed ${data.processed || 0} SMS notifications`,
      });

      console.log('SMS processing result:', data);
    } catch (error: any) {
      console.error('SMS processing failed:', error);
      toast({
        title: 'SMS Processing Failed',
        description: error.message || 'Failed to process SMS notifications',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Match Notifications</CardTitle>
          <CardDescription>
            Test the complete match notification system including emails, in-app notifications, and SMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="matchId">Match ID</Label>
              <Input
                id="matchId"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                placeholder="Enter match ID"
              />
            </div>
            <div>
              <Label htmlFor="rationale">Rationale</Label>
              <Input
                id="rationale"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Match rationale"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user1Id">User 1 ID</Label>
              <Input
                id="user1Id"
                value={user1Id}
                onChange={(e) => setUser1Id(e.target.value)}
                placeholder="Enter user 1 ID"
              />
            </div>
            <div>
              <Label htmlFor="user2Id">User 2 ID</Label>
              <Input
                id="user2Id"
                value={user2Id}
                onChange={(e) => setUser2Id(e.target.value)}
                placeholder="Enter user 2 ID"
              />
            </div>
          </div>
          <Button 
            onClick={handleTestMatchNotification}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Sending...' : 'Send Test Match Notification'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Notification Processing</CardTitle>
          <CardDescription>
            Manually trigger SMS notification processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleProcessSmsNotifications}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Process Pending SMS Notifications'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};