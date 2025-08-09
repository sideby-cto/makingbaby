
import { centralizedEmailService } from './centralizedEmailService';

interface MatchNotificationData {
  recipientEmail: string;
  recipientName: string;
  matchedUserName: string;
  rationale: string;
}

export const sendMatchNotificationEmail = async (data: MatchNotificationData) => {
  return await centralizedEmailService.sendTemplatedEmail({
    templateKey: 'match_message_notification',
    recipientEmail: data.recipientEmail,
    recipientName: data.recipientName,
    variables: [
      { name: 'recipient_name', value: data.recipientName },
      { name: 'partner_name', value: data.matchedUserName },
      { name: 'message_content', value: `You've been matched with ${data.matchedUserName}! ${data.rationale}` }
    ]
  });
};

export const sendWelcomeEmail = async (recipientEmail: string, userName: string) => {
  return await centralizedEmailService.sendTemplatedEmail({
    templateKey: 'welcome_email',
    recipientEmail,
    recipientName: userName,
    variables: [
      { name: 'user_name', value: userName }
    ]
  });
};
