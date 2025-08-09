// Utility functions for message handling

/**
 * Checks if a sender is an admin based on sender_id and sender_type
 */
export const isSenderAdmin = (senderId: string, senderType?: string): boolean => {
  // First check the explicit sender_type field
  if (senderType === 'admin') {
    return true;
  }
  
  // Legacy check for backward compatibility
  if (
    senderId === '00000000-0000-0000-0000-000000000000' ||
    senderId === 'admin' ||
    senderId === 'robot@sideby' ||
    (typeof senderId === 'string' && senderId.includes('@sideby'))
  ) {
    return true;
  }
  
  return false;
};

/**
 * Formats a sender name based on user type and information
 */
export const formatSenderName = (
  senderId: string, 
  currentUserId: string, 
  senderType?: string,
  partnerName?: string
): string => {
  if (isSenderAdmin(senderId, senderType)) {
    return 'sideby Team';
  }
  
  if (senderId === currentUserId) {
    return 'You';
  }
  
  return partnerName || 'Partner';
};

/**
 * Get the display name for a message sender
 */
export const getSenderName = (
  message: { sender_id: string; sender_type?: string },
  currentUserId?: string | null,
  partnerInfo?: { name?: string } | null
): string => {
  if (isSenderAdmin(message.sender_id, message.sender_type)) {
    return 'sideby Team';
  }
  
  if (currentUserId && message.sender_id === currentUserId) {
    return 'You';
  }
  
  return partnerInfo?.name || 'Partner';
};

/**
 * Get the avatar URL for a message sender
 */
export const getSenderAvatar = (
  message: { sender_id: string; sender_type?: string },
  currentUserId?: string | null,
  partnerInfo?: { avatar_url?: string } | null
): string | undefined => {
  // If the message is from an admin, no avatar
  if (isSenderAdmin(message.sender_id, message.sender_type)) {
    return undefined;
  }
  
  // If the message is from the current user, no avatar for now
  if (currentUserId && message.sender_id === currentUserId) {
    return undefined;
  }
  
  // Otherwise, it's from the partner
  return partnerInfo?.avatar_url;
};
