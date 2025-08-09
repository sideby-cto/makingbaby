
import { MatchMessage, PartnerInfo } from "../types";
import { isSenderAdmin } from "@/contexts/message/messageUtils";

/**
 * Transform raw message data from the database into a standardized MatchMessage format
 */
export const transformMessageData = (
  messageData: any,
  userId: string,
  partnerInfo: PartnerInfo | null
): MatchMessage => {
  if (!messageData) {
    throw new Error("Cannot transform null or undefined message data");
  }
  
  // Ensure required fields are present
  if (!messageData.id || !messageData.match_id || !messageData.sender_id) {
    console.error("Message data missing required fields:", messageData);
    throw new Error("Message data missing required fields");
  }

  // Determine if this message is from an admin
  const senderType = isSenderAdmin(messageData.sender_id, messageData.sender_type) 
    ? 'admin' as const
    : 'user' as const;
  
  // Check if this is from the current user
  const isCurrentUser = messageData.sender_id === userId;
  
  // Determine the sender name based on the message type and source
  let senderName: string;
  if (senderType === 'admin') {
    senderName = 'sideby Team';
  } else if (isCurrentUser) {
    senderName = 'You';
  } else if (partnerInfo?.name) {
    senderName = partnerInfo.name;
  } else {
    senderName = 'Partner';
  }
  
  // Transform the message to our standardized format
  const transformedMessage: MatchMessage = {
    id: messageData.id,
    match_id: messageData.match_id,
    sender_id: messageData.sender_id,
    content: messageData.content || '',
    created_at: messageData.created_at,
    updated_at: messageData.updated_at || messageData.created_at, 
    sender_type: senderType,
    timezone: messageData.timezone || null,
    isCurrentUser,
    senderName,
    sender_avatar: !isCurrentUser && senderType !== 'admin' ? partnerInfo?.avatar_url : undefined
  };
  
  return transformedMessage;
};

/**
 * Transforms a batch of messages
 */
export const transformMessageBatch = (
  messages: any[],
  userId: string,
  partnerInfo: PartnerInfo | null
): MatchMessage[] => {
  if (!messages || !Array.isArray(messages)) {
    return [];
  }
  
  try {
    return messages
      .map(msg => transformMessageData(msg, userId, partnerInfo))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.error("Error transforming message batch:", error);
    return [];
  }
};
