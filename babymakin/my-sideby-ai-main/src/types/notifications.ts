
/**
 * Types for notification system
 */

export interface NotificationsByType {
  [type: string]: Array<{
    title: string;
    content: string;
    id?: string;
    created_at?: string;
    data?: Record<string, any>;
  }>;
}

export interface EmailNotification {
  title: string;
  content: string;
  id?: string;
  created_at?: string;
  data?: Record<string, any>;
}

// Define notification types locally instead of importing from another file
export enum NotificationType {
  MATCH_CREATED = 'match_created',
  MATCH_MESSAGE = 'match_message',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  REMINDER = 'reminder',
  NEW_CONTENT = 'new_content',
  MATCH_COMPLETED = 'match_completed',
  MATCH_SCHEDULED = 'match_scheduled',
  NEW_IDEA = 'new_idea',
  MEETING_CONFIRMED = 'meeting_confirmed',
  ADMIN_ALERT = 'admin_alert',
  SYSTEM = 'system'
}
