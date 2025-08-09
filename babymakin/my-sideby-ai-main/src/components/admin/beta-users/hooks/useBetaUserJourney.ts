
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sendAdminNotification } from '@/services/notifications/adminNotificationService';
import { useToast } from '@/hooks/use-toast';
import { NotificationType } from '@/contexts/notification/types';

export interface BetaUserJourneyData {
  stage: string;
  daysSinceRegistration: number;
  isActive: boolean;
  isProfileComplete: boolean;
  hatsCount: number;
  activeMatchCount: number;
  completedMatchCount: number;
  hasScheduledMeeting: boolean;
  pacing_level?: string;
}

export const useBetaUserJourney = (userId?: string) => {
  const [journeyData, setJourneyData] = useState<BetaUserJourneyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchJourneyData = async () => {
      setLoading(true);
      try {
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('created_at, first_name, last_name, onboarding_completed, subject_statuses')
          .eq('id', userId)
          .single();

        // Get user's active matches
        const { data: activeMatches } = await supabase
          .from('matches')
          .select('id')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .eq('status', 'active');

        // Get user's completed matches
        const { data: completedMatches } = await supabase
          .from('matches')
          .select('id')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .eq('status', 'completed');

        // Get scheduled meetings
        const { data: scheduledMeetings } = await supabase
          .from('match_meeting_times')
          .select('id')
          .in('match_id', (activeMatches || []).map(m => m.id))
          .eq('status', 'confirmed');

        // Get user's pacing preferences
        const { data: pacingData } = await supabase
          .from('user_pacing_preferences')
          .select('pacing_level')
          .eq('user_id', userId)
          .single();

        // Calculate days since registration
        const createdAt = profileData?.created_at ? new Date(profileData.created_at) : new Date();
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Count the number of hats (subject statuses)
        const hatsCount = profileData?.subject_statuses?.length || 0;

        // Determine journey stage based on collected data
        let stage = 'new';
        if ((activeMatches && activeMatches.length > 0) || (completedMatches && completedMatches.length > 0)) {
          stage = 'matched';
          if (scheduledMeetings && scheduledMeetings.length > 0) {
            stage = 'scheduled';
            // Further stages would be determined by additional checks
            // like conversation analysis or completion data
          }
        }

        setJourneyData({
          stage,
          daysSinceRegistration: diffDays,
          isActive: true, // Assuming all beta users are active
          isProfileComplete: !!profileData?.onboarding_completed,
          hatsCount,
          activeMatchCount: activeMatches?.length || 0,
          completedMatchCount: completedMatches?.length || 0,
          hasScheduledMeeting: (scheduledMeetings?.length || 0) > 0,
          pacing_level: pacingData?.pacing_level
        });
      } catch (error) {
        console.error('Error fetching beta user journey data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyData();
  }, [userId]);

  const sendNotification = async (
    userId: string,
    notification: { title: string; content: string }
  ) => {
    try {
      const { success, error } = await sendAdminNotification({
        userId,
        title: notification.title,
        content: notification.content,
        type: NotificationType.SYSTEM,
        data: {
          isBetaNotification: true,
          timestamp: new Date().toISOString()
        }
      });

      if (success) {
        toast({
          title: 'Notification sent',
          description: `Successfully sent notification to the beta user.`,
          variant: 'default',
        });
      } else {
        throw new Error(error?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Failed to send notification',
        description: 'There was an error sending the notification.',
        variant: 'destructive',
      });
    }
  };

  return {
    journeyData,
    loading,
    sendNotification
  };
};
