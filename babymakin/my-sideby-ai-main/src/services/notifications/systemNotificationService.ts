
import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/contexts/notification/types";
import { createNotification } from "./notificationService";

interface SystemAnnouncementParams {
  title: string;
  content: string;
  targetUserIds?: string[];
  targetCommunityIds?: string[];
  data?: Record<string, any>;
}

interface SystemReminderParams {
  title: string;
  content: string;
  targetUserIds?: string[];
  targetCommunityIds?: string[];
  data?: Record<string, any>;
}

/**
 * Send a system announcement to all users or specific users/communities
 */
export const sendSystemAnnouncement = async ({
  title,
  content,
  targetUserIds,
  targetCommunityIds,
  data = {}
}: SystemAnnouncementParams): Promise<{ success: boolean; error?: any }> => {
  try {
    let userIds: string[] = [];
    
    // If specific user IDs are provided, use those
    if (targetUserIds && targetUserIds.length > 0) {
      userIds = targetUserIds;
    } 
    // If community IDs are provided, get all users in those communities
    else if (targetCommunityIds && targetCommunityIds.length > 0) {
      const { data: communityMembers, error } = await supabase
        .from('community_members')
        .select('user_id')
        .in('community_id', targetCommunityIds)
        .eq('status', 'active');
        
      if (error) throw error;
      
      userIds = communityMembers.map(member => member.user_id);
    } 
    // Otherwise, get all active users
    else {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('status', 'active');
        
      if (error) throw error;
      
      userIds = profiles.map(profile => profile.id);
    }
    
    // Send notification to each user
    for (const userId of userIds) {
      await createNotification({
        userId,
        type: NotificationType.SYSTEM_ANNOUNCEMENT, // Now defined in the enum
        title,
        content,
        data: {
          ...data,
          is_system_announcement: true,
          timestamp: new Date().toISOString()
        },
        idempotencyKey: `announcement-${userId}-${Date.now()}`
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending system announcement:', error);
    return { success: false, error };
  }
};

/**
 * Send a reminder notification to specific users
 */
export const sendReminder = async ({
  title,
  content,
  targetUserIds,
  targetCommunityIds,
  data = {}
}: SystemReminderParams): Promise<{ success: boolean; error?: any }> => {
  try {
    let userIds: string[] = [];
    
    // If specific user IDs are provided, use those
    if (targetUserIds && targetUserIds.length > 0) {
      userIds = targetUserIds;
    } 
    // If community IDs are provided, get all users in those communities
    else if (targetCommunityIds && targetCommunityIds.length > 0) {
      const { data: communityMembers, error } = await supabase
        .from('community_members')
        .select('user_id')
        .in('community_id', targetCommunityIds)
        .eq('status', 'active');
        
      if (error) throw error;
      
      userIds = communityMembers.map(member => member.user_id);
    } else {
      throw new Error('Either targetUserIds or targetCommunityIds must be provided for reminders');
    }
    
    // Send reminder to each user
    for (const userId of userIds) {
      await createNotification({
        userId,
        type: NotificationType.REMINDER, // Now defined in the enum
        title,
        content,
        data: {
          ...data,
          is_reminder: true,
          timestamp: new Date().toISOString()
        },
        idempotencyKey: `reminder-${userId}-${Date.now()}`
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending reminder:', error);
    return { success: false, error };
  }
};
