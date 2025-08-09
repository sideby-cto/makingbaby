
import { z } from "zod";

export enum NotificationType {
  MATCH_CREATED = "match_created",
  MATCH_MESSAGE = "match_message",
  SYSTEM_ANNOUNCEMENT = "system_announcement",
  REMINDER = "reminder",
  NEW_CONTENT = "new_content",
  MATCH_COMPLETED = "match_completed",
  MATCH_SCHEDULED = "match_scheduled",
  NEW_IDEA = "new_idea",
  MEETING_CONFIRMED = "meeting_confirmed",
  ADMIN_ALERT = "admin_alert",
  SYSTEM = "system",
  BETA_USER_ALERT = "beta_user_alert",
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  in_app: boolean;
}

export const notificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  read: z.boolean(),
  data: z.record(z.any()).optional(),
  created_at: z.string(),
});

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  idempotencyKey?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<boolean>;  // Changed return type to boolean
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<boolean>;
  fetchNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (
    prefs: NotificationPreferences,
  ) => Promise<{ success: boolean; error?: any }>;
  loading: boolean;
  addToast: (toast: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive" | "success";
    position?:
      | "top-right"
      | "top-center"
      | "top-left"
      | "bottom-right"
      | "bottom-center"
      | "bottom-left";
      duration?: number;
  }) => void;
}
