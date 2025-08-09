
import { supabase } from "@/integrations/supabase/client";
import { sendUserNotification } from "@/services/notifications";
import { NotificationType } from "@/contexts/notification/types";
import { checkExistingSimilarNotification } from "@/services/notifications/notificationUtils";

/**
 * Gets sender info for notifications
 */
export const getSenderInfo = async (senderId: string, senderType: 'admin' | 'user') => {
  if (senderType === 'admin') {
    return { name: 'sideby Team' };
  }
  
  try {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', senderId)
      .single();
      
    return { 
      name: data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() : 'Your match' 
    };
  } catch (err) {
    console.error('Error fetching sender info:', err);
    return { name: 'Your match' };
  }
};

/**
 * Sends a notification for a new message
 * Note: SMS notifications are now handled only by the digest system
 */
export const sendMessageNotification = async (
  matchId: string, 
  currentUserId: string, 
  newMessage: any
) => {
  console.log('Sending message notification (in-app only):', { matchId, currentUserId, messageId: newMessage.id });
  
  // Only send notification if user is not the sender
  if (newMessage.sender_id !== currentUserId) {
    // Use explicit sender_type if available, otherwise determine it
    const senderType = newMessage.sender_type || 
      (newMessage.sender_id === 'admin' || newMessage.sender_id === 'robot@sideby' ? 'admin' : 'user');
    
    const { name } = await getSenderInfo(newMessage.sender_id, senderType);
    
    // Create a reliable deduplication key WITHOUT timestamp
    // This ensures we don't create duplicate notifications for the same message
    const idempotencyKey = `msg_${newMessage.id}`;
    
    // First check if a similar notification exists before sending a new one
    const { exists } = await checkExistingSimilarNotification(
      currentUserId,
      NotificationType.MATCH_MESSAGE,
      newMessage.content.substring(0, 50)
    );
    
    if (exists) {
      console.log('Similar notification already exists, skipping');
      return;
    }
    
    try {
      // Send only in-app notification - SMS will be handled by digest system
      const result = await sendUserNotification({
        userId: currentUserId,
        title: `New message from ${name}`,
        content: newMessage.content.length > 50 
          ? `${newMessage.content.substring(0, 50)}...` 
          : newMessage.content,
        type: NotificationType.MATCH_MESSAGE,
        data: { matchId: matchId },
        sendSMS: false, // Disabled - handled by digest system
        sendEmail: false, // Email handled by send-match-email function
        idempotencyKey // Consistent key without timestamp for better deduplication
      });
      
      console.log('In-app notification send result:', result);
      console.log('Note: SMS notifications are handled by the digest system');
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }
};

/**
 * Determines the sender type based on sender ID or explicit sender_type
 */
export const determineSenderType = (senderId: string, senderType?: string): 'admin' | 'user' => {
  // First check explicit sender_type if provided
  if (senderType === 'admin') return 'admin';
  
  // Fall back to checking sender_id
  return senderId === 'admin' || 
    senderId === 'robot@sideby' || 
    (typeof senderId === 'string' && senderId.includes('@sideby.ai'))
      ? 'admin' 
      : 'user';
};
