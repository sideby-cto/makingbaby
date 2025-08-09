
import { sendAdminNotification } from './adminNotificationService';
import { NotificationType } from '@/contexts/notification/types';
import { supabase } from '@/integrations/supabase/client';

const BETA_NOTIFICATION_TEMPLATES = {
  WEEK_1_EXPLORE: {
    title: 'Welcome to Your First Week!',
    content: 'This week, explore the tools in sideby, set up your profile, and add a few "hats" to help us match you with the right partners.'
  },
  DAY_7_ADMIN_ALERT: {
    title: 'Beta User at Day 7',
    content: 'A beta user has reached Day 7 in their journey. Please ensure they are matched with a partner soon.'
  },
  DAY_9_MATCH: {
    title: 'Your Learning Match is Ready!',
    content: 'Good news! We\'ve found you a learning partner. Check your dashboard to connect and schedule a time to meet.'
  },
  SCHEDULING_REMINDER: {
    title: 'Schedule Your Learning Session',
    content: 'Don\'t forget to schedule your learning session with your match. It only takes 18 minutes and can be done virtually.'
  },
  MONTH_COMPLETE: {
    title: 'Monthly Cycle Complete',
    content: 'Congratulations on completing your monthly beta cycle! Next month starts soon with new opportunities to explore tools and matches.'
  }
};

export interface BetaUserNotificationParams {
  userId: string;
  notificationType: keyof typeof BETA_NOTIFICATION_TEMPLATES;
  customData?: Record<string, any>;
}

/**
 * Send a notification to a beta user based on predefined templates
 */
export const sendBetaUserNotification = async ({
  userId,
  notificationType,
  customData = {}
}: BetaUserNotificationParams): Promise<{ success: boolean; error?: any }> => {
  try {
    const template = BETA_NOTIFICATION_TEMPLATES[notificationType];
    
    if (!template) {
      throw new Error(`Invalid notification type: ${notificationType}`);
    }
    
    const result = await sendAdminNotification({
      userId,
      title: template.title,
      content: template.content,
      type: NotificationType.SYSTEM,
      data: {
        ...customData,
        isBetaNotification: true,
        betaNotificationType: notificationType,
        timestamp: new Date().toISOString()
      }
    });
    
    // Log the notification in the engagement logs for tracking
    if (result.success) {
      await supabase
        .from('engagement_logs')
        .insert({
          user_id: userId,
          engagement_type: `beta_notification_${notificationType.toLowerCase()}`,
          community_id: null
        });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending beta user notification:', error);
    return { success: false, error };
  }
};

/**
 * Send a notification to admins about a beta user's progress
 */
export const sendBetaAdminAlert = async (
  betaUserId: string,
  alertType: string,
  details: Record<string, any>
): Promise<{ success: boolean; error?: any }> => {
  try {
    // First get all admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .like('email', '%@sideby.ai');
    
    if (adminError) {
      throw adminError;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.warn('No admin users found to send alerts to');
      return { success: false, error: 'No admin users found' };
    }
    
    // Get beta user details
    const { data: betaUser } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', betaUserId)
      .single();
    
    const userName = betaUser 
      ? `${betaUser.first_name || ''} ${betaUser.last_name || ''}`.trim() || betaUser.email 
      : 'Unknown user';
    
    // Send notifications to all admins
    const results = await Promise.all(
      adminUsers.map(admin => 
        sendAdminNotification({
          userId: admin.id,
          title: `Beta Alert: ${alertType}`,
          content: `Beta user ${userName} needs attention: ${alertType}`,
          type: NotificationType.ADMIN_ALERT,
          data: {
            betaUserId,
            alertType,
            userName,
            details,
            timestamp: new Date().toISOString()
          }
        })
      )
    );
    
    // If any notification was successful, consider it a success
    const anySuccess = results.some(r => r.success);
    
    return { 
      success: anySuccess, 
      error: anySuccess ? undefined : 'Failed to send notifications to any admin' 
    };
  } catch (error) {
    console.error('Error sending beta admin alert:', error);
    return { success: false, error };
  }
};

/**
 * Check for beta users that need notifications based on their journey progress
 */
export const checkBetaUserJourneyNotifications = async (): Promise<{ 
  processed: number; 
  sent: number; 
  errors: number;
}> => {
  try {
    // Get all beta users
    const { data: betaUsers, error: betaError } = await supabase
      .from('beta_users')
      .select('user_id');
    
    if (betaError) throw betaError;
    
    if (!betaUsers || betaUsers.length === 0) {
      return { processed: 0, sent: 0, errors: 0 };
    }
    
    const userIds = betaUsers.map(u => u.user_id);
    
    // Get profiles for all beta users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, created_at')
      .in('id', userIds);
    
    if (profileError) throw profileError;
    
    if (!profiles || profiles.length === 0) {
      return { processed: 0, sent: 0, errors: 0 };
    }
    
    let sent = 0;
    let errors = 0;
    
    // Process each beta user
    for (const profile of profiles) {
      try {
        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const daysSinceRegistration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dayInCycle = daysSinceRegistration % 30;
        
        // Day 1: Send welcome notification
        if (dayInCycle === 1) {
          const result = await sendBetaUserNotification({
            userId: profile.id,
            notificationType: 'WEEK_1_EXPLORE'
          });
          if (result.success) sent++;
          else errors++;
        }
        
        // Day 7: Notify admins about approaching match deadline
        if (dayInCycle === 7) {
          const result = await sendBetaAdminAlert(
            profile.id,
            'Day 7 Reached - Match Needed',
            { daysSinceRegistration, dayInCycle }
          );
          if (result.success) sent++;
          else errors++;
        }
        
        // Day 9: Send match notification (if no match, send a special notification)
        if (dayInCycle === 9) {
          // Check if user has any active matches
          const { data: matches } = await supabase
            .from('matches')
            .select('id')
            .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
            .eq('status', 'active');
          
          if (matches && matches.length > 0) {
            const result = await sendBetaUserNotification({
              userId: profile.id,
              notificationType: 'DAY_9_MATCH'
            });
            if (result.success) sent++;
            else errors++;
          } else {
            // If no match, alert admins
            await sendBetaAdminAlert(
              profile.id,
              'No match for Day 9 beta user',
              { daysSinceRegistration, dayInCycle, urgent: true }
            );
          }
        }
        
        // Day 30: End of cycle notification
        if (dayInCycle === 0 || dayInCycle === 30) {
          const result = await sendBetaUserNotification({
            userId: profile.id,
            notificationType: 'MONTH_COMPLETE'
          });
          if (result.success) sent++;
          else errors++;
        }
      } catch (error) {
        console.error(`Error processing beta user ${profile.id}:`, error);
        errors++;
      }
    }
    
    return {
      processed: profiles.length,
      sent,
      errors
    };
  } catch (error) {
    console.error('Error checking beta user journey notifications:', error);
    return { processed: 0, sent: 0, errors: 1 };
  }
};
