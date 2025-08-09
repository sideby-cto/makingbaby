
import type { Profile, NotificationPreferences } from "@/types/profile";
import type { Json } from "@/integrations/supabase/types";
import type { PacingLevel } from "@/components/dashboard/pacing/types";

export const transformProfileData = (profileData: any): Profile => {
  const pacing = profileData.user_pacing_preferences?.[0]
    ? {
        level: profileData.user_pacing_preferences[0].pacing_level as PacingLevel,
        community_name: profileData.user_pacing_preferences[0].community?.name || "",
        community_id: profileData.user_pacing_preferences[0].community_id,
      }
    : null;

  // Create a default notification preferences object
  const defaultNotificationPreferences: NotificationPreferences = {
    email: true,
    sms: false,
    in_app: true,
  };

  // Transform the notification_preferences from the database into the correct type
  let notificationPreferences: NotificationPreferences;

  if (profileData.notification_preferences) {
    // Check if it's an object with the expected properties
    if (
      typeof profileData.notification_preferences === "object" &&
      profileData.notification_preferences !== null &&
      !Array.isArray(profileData.notification_preferences)
    ) {
      // Create notification preferences with defaults for any missing properties
      notificationPreferences = {
        email:
          typeof (profileData.notification_preferences as any).email === "boolean"
            ? (profileData.notification_preferences as any).email
            : defaultNotificationPreferences.email,
        sms:
          typeof (profileData.notification_preferences as any).sms === "boolean"
            ? (profileData.notification_preferences as any).sms
            : defaultNotificationPreferences.sms,
        in_app:
          typeof (profileData.notification_preferences as any).in_app === "boolean"
            ? (profileData.notification_preferences as any).in_app
            : defaultNotificationPreferences.in_app,
      };
    } else {
      // Use default if data is malformed
      notificationPreferences = defaultNotificationPreferences;
    }
  } else {
    // Use default if no notification preferences exist
    notificationPreferences = defaultNotificationPreferences;
  }

  return {
    id: profileData.id,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    bio: profileData.bio,
    teaching_experience: profileData.teaching_experience,
    subjects: profileData.subjects,
    avatar_url: profileData.avatar_url,
    created_at: profileData.created_at,
    updated_at: profileData.updated_at,
    email: profileData.email,
    approved_stance: profileData.approved_stance,
    subject_statuses:
      profileData.subject_statuses?.map((status: Json) => {
        if (typeof status === "object" && status !== null) {
          return {
            name: (status as any).name || "",
            status: (status as any).status || "current",
          };
        }
        return { name: "", status: "current" };
      }) || null,
    phone_number: profileData.phone_number || null,
    phone_verified: profileData.phone_verified || false,
    notification_preferences: notificationPreferences,
    pacing: pacing,
    isAdmin: false, // Will be set by the calling hook
    location: profileData.location || null,
    primary_flow_activity: (profileData as any).primary_flow_activity || null,
  };
};
