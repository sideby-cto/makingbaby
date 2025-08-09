import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { processSubjectStatuses } from "./matchUtils";
import { Json } from "@/integrations/supabase/types";
import { toMatchmakingProfile } from "./matchmakingProfileUtils";

// Helper function to identify admin users by email
// We'll keep this for reference but not use it for filtering
const isAdminUser = (email: string) => {
  return email.endsWith('@sideby.ai');
};

export const getUnmatchedUsers = async (): Promise<Profile[]> => {
  // Get all users with active status
  const { data: activeUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*, has_completed_reflection, primary_flow_activity')
    .eq('status', 'active');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return [];
  }

  // Get users who have active matches
  const { data: matchedUsers, error: matchesError } = await supabase
    .from('matches')
    .select('user1_id, user2_id')
    .eq('status', 'active');

  if (matchesError) {
    console.error('Error fetching matches:', matchesError);
    return [];
  }

  // Create a set of users who have active matches
  const matchedUserIds = new Set<string>();
  matchedUsers?.forEach(match => {
    matchedUserIds.add(match.user1_id);
    matchedUserIds.add(match.user2_id);
  });

  // Get admin users (extra verification beyond email check)
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('id');

  const adminUserIds = new Set<string>();
  adminUsers?.forEach(user => {
    adminUserIds.add(user.id);
  });

  // Filter out users who already have active matches and admin users
  return activeUsers
    ?.filter(user => {
      // Exclude matched users
      if (matchedUserIds.has(user.id)) return false;
      
      // Only exclude users that are in the admin_users table
      if (adminUserIds.has(user.id)) return false;
      
      // Include all other users, even if they have sideby.ai emails
      return true;
    })
    .map(user => {
      // Process subject_statuses correctly
      const processedUser = {
        ...user,
        subject_statuses: processSubjectStatuses(user.subject_statuses as Json)
      };
      
      return {
        ...processedUser,
        primary_flow_activity: user.primary_flow_activity || null,
        notification_preferences: processNotificationPreferences(user.notification_preferences),
        has_completed_reflection: !!user.has_completed_reflection // Ensure boolean type
      } as Profile;
    }) || [];
};

// Helper function to properly format notification preferences
function processNotificationPreferences(preferences: any): { email: boolean; sms: boolean; in_app: boolean } {
  if (!preferences || typeof preferences !== 'object') {
    return { email: true, sms: false, in_app: true }; // Default values
  }
  
  return {
    email: preferences.email !== false, // Default to true unless explicitly false
    sms: Boolean(preferences.sms),
    in_app: preferences.in_app !== false // Default to true unless explicitly false
  };
}
