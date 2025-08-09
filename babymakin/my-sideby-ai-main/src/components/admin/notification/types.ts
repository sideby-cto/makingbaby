
export interface PendingNotification {
  id: string;
  user_id: string;
  notification_type: string;
  channel: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export interface NotificationLog {
  id: string;
  notification_id: string;
  source_table: string;
  channel: string;
  success: boolean;
  attempt_count: number;
  last_attempt_at: string;
  error?: string;
}
