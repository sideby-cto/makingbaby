// Helper functions for determining message sender details

// Use the imported PartnerInfo type instead of defining a local one
import { PartnerInfo } from "../types";

/**
 * Check if a message is from an admin based on the sender_type or sender_id
 */
export const isSenderAdmin = (senderId: string, senderType?: string): boolean => {
  // First, check the sender_type if available (most reliable)
  if (senderType === 'admin') {
    return true;
  }
  
  // Then check the sender_id (fallback method)
  return senderId === 'admin' || 
         senderId === 'robot@sideby' || 
         (typeof senderId === 'string' && senderId.toLowerCase().includes('@sideby'));
};

/**
 * Extract a formatted name from an email address
 * @param email Email address to parse
 * @returns Formatted name
 */
export const getNameFromEmail = (email: string): string => {
  if (!email.includes('@')) return email;
  
  try {
    const emailName = email.split('@')[0];
    
    // Convert formats like "firstname+lastname" or "firstname.lastname" to proper names
    if (emailName.includes('+')) {
      return emailName.split('+')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } 
    
    if (emailName.includes('.')) {
      // Convert firstname.lastname to "Firstname Lastname"
      return emailName.split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } 
    
    // Just capitalize the first letter for simple names
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  } catch (error) {
    console.error("Error parsing name from email:", error);
    return 'Unknown User';
  }
};

/**
 * Get the display name for a message sender based on sender_type and sender_id
 */
export const getSenderName = (
  senderId: string, 
  currentUserId: string, 
  partnerInfo: PartnerInfo | null,
  senderType?: string,
  adminName?: string // Add parameter for the pre-processed admin name
): string => {
  // If the message is explicitly marked as admin via sender_type
  if (senderType === 'admin' || isSenderAdmin(senderId)) {
    // Use the pre-processed admin name if available
    if (adminName) {
      return adminName;
    }
    
    return 'sideby Team';
  }
  
  // If the message is from the current user
  if (senderId === currentUserId) {
    return 'You';
  }
  
  // Otherwise, it's from the partner
  return partnerInfo?.name || 'Partner';
};

/**
 * Get the avatar URL for a message sender
 */
export const getSenderAvatar = (
  senderId: string, 
  currentUserId: string, 
  partnerInfo: PartnerInfo | null,
  senderType?: string
): string | undefined => {
  // If the message is from an admin
  if (senderType === 'admin' || isSenderAdmin(senderId)) {
    return undefined; // Admin uses default avatar
  }
  
  // If the message is from the current user, use their avatar (not implemented yet)
  if (senderId === currentUserId) {
    return undefined;
  }
  
  // Otherwise, it's from the partner
  return partnerInfo?.avatar_url || partnerInfo?.avatar; // Support both avatar fields
};
