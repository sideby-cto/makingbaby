
export interface MatchMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_type?: 'user' | 'admin';
  senderName?: string;
}

/**
 * Checks if a message is from an admin
 * Uses both sender_type field (modern approach) and sender_id check (legacy approach)
 */
export const isAdminMessage = (message: MatchMessage): boolean => {
  // First check the explicit sender_type field
  if (message.sender_type === 'admin') {
    return true;
  }
  
  // Legacy check for backward compatibility
  if (
    message.sender_id === '00000000-0000-0000-0000-000000000000' ||
    message.sender_id === 'admin' ||
    message.sender_id === 'robot@sideby' ||
    (typeof message.sender_id === 'string' && message.sender_id.includes('@sideby'))
  ) {
    return true;
  }
  
  return false;
};
