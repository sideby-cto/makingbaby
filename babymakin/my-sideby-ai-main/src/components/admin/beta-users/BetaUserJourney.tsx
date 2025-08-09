
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, UserCog, Bell } from 'lucide-react';
import { useBetaUserJourney } from './hooks/useBetaUserJourney';
import { BetaUser } from './types';

interface BetaUserJourneyProps {
  selectedUser: BetaUser | null;
}

export const BetaUserJourney: React.FC<BetaUserJourneyProps> = ({ selectedUser }) => {
  const { journeyData, loading, sendNotification } = useBetaUserJourney(selectedUser?.user_id);

  if (!selectedUser) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Select a beta user to view their journey
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            <span>Loading journey data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDaysSinceRegistration = () => {
    return journeyData?.daysSinceRegistration || 0;
  };

  const getMonthlyProgress = () => {
    const days = getDaysSinceRegistration();
    // Consider month as 30 days for simplicity
    return Math.min(100, Math.round((days % 30) / 30 * 100));
  };

  const formatBetaStage = (stage: string) => {
    return stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isAtCriticalDay = (days: number) => {
    // Check if the user is exactly at day 7 (time to create match)
    return days % 30 === 7;
  };

  const handleSendReminderNotification = () => {
    if (selectedUser) {
      sendNotification(selectedUser.user_id, {
        title: 'Explore sideby Tools',
        content: 'This is your first week! Explore the available tools, set them up, and add a few "hats" to your profile.'
      });
    }
  };

  const handleSendMatchNotification = () => {
    if (selectedUser) {
      sendNotification(selectedUser.user_id, {
        title: 'Your Learning Match is Ready',
        content: 'Good news! We\'ve found a learning partner for you. Check your dashboard to connect and schedule a time to meet.'
      });
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Beta Journey for {selectedUser.first_name || selectedUser.email}</span>
          <Badge variant={journeyData?.isActive ? "default" : "outline"}>
            {journeyData?.isActive ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Monitoring the beta user's progress through their journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Days since registration</div>
              <div className="text-2xl font-bold">{getDaysSinceRegistration()}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Monthly cycle progress</div>
              <div className="relative w-36 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                  style={{ width: `${getMonthlyProgress()}%` }}
                ></div>
              </div>
              <div className="text-xs text-right mt-1">Day {getDaysSinceRegistration() % 30} of 30</div>
            </div>
          </div>

          {isAtCriticalDay(getDaysSinceRegistration()) && (
            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-800">Day 7 Reached</AlertTitle>
              <AlertDescription className="text-amber-700">
                This user needs a match created by day 9. Please ensure a match is scheduled.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Current Stage</h4>
            <Badge variant="secondary" className="text-sm">
              {formatBetaStage(journeyData?.stage || 'new')}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 border rounded-md">
              <div className="flex items-center">
                <UserCog className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Onboarding</span>
              </div>
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Profile Complete</span>
                  <Badge variant={journeyData?.isProfileComplete ? "default" : "outline"} className={journeyData?.isProfileComplete ? "bg-green-100 text-green-800 border-green-300 text-xs" : "text-xs"}>
                    {journeyData?.isProfileComplete ? "Done" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span>Hats Added</span>
                  <Badge variant={journeyData?.hatsCount > 0 ? "default" : "outline"} className={journeyData?.hatsCount > 0 ? "bg-green-100 text-green-800 border-green-300 text-xs" : "text-xs"}>
                    {journeyData?.hatsCount || 0}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="p-3 border rounded-md">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Matches</span>
              </div>
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Active Matches</span>
                  <Badge variant={journeyData?.activeMatchCount > 0 ? "default" : "outline"} className={journeyData?.activeMatchCount > 0 ? "bg-green-100 text-green-800 border-green-300 text-xs" : "text-xs"}>
                    {journeyData?.activeMatchCount || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span>Scheduled Meetings</span>
                  <Badge variant={journeyData?.hasScheduledMeeting ? "default" : "outline"} className={journeyData?.hasScheduledMeeting ? "bg-green-100 text-green-800 border-green-300 text-xs" : "text-xs"}>
                    {journeyData?.hasScheduledMeeting ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Admin Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleSendReminderNotification}>
                <Bell className="mr-1 h-3 w-3" />
                Send Week 1 Reminder
              </Button>
              <Button size="sm" variant="outline" onClick={handleSendMatchNotification}>
                <Bell className="mr-1 h-3 w-3" />
                Send Match Notification
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
