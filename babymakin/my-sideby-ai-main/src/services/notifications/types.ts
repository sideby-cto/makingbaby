export interface MatchNotificationData {
  matchId: string;
  user1_id: string;
  user2_id: string;
  rationale: string;
}

export interface NotificationResult {
  success: boolean;
  id?: string;
  error?: any;
}

export interface SendNotificationOptions {
  userId: string;
  type: string;
  title: string;
  content: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  sendSMS?: boolean;
  idempotencyKey?: string;
}