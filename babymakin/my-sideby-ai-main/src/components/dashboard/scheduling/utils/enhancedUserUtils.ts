
import { PartnerInfo } from "../types";

export interface UserDisplayInfo {
  name: string;
  shortName: string;
  initials: string;
  isCurrentUser: boolean;
  isAdmin: boolean;
  role: 'current_user' | 'partner' | 'admin';
  fullDisplayName: string;
}

/**
 * Enhanced user identification with view-as context support
 */
export const getEnhancedUserInfo = (
  senderId: string,
  currentUserId: string,
  partnerInfo: PartnerInfo | null,
  senderType?: string,
  isViewAsMode?: boolean,
  viewAsUserId?: string
): UserDisplayInfo => {
  const isAdminMessage = senderType === 'admin' || 
    senderId === 'admin' || 
    senderId === 'robot@sideby' || 
    (typeof senderId === 'string' && senderId.includes('@sideby'));

  // Handle admin messages
  if (isAdminMessage) {
    return {
      name: 'sideby Admin',
      shortName: 'Admin',
      initials: 'SA',
      isCurrentUser: false,
      isAdmin: true,
      role: 'admin',
      fullDisplayName: 'sideby Admin'
    };
  }

  // Determine if this is the current user's message
  let isCurrentUserMessage = senderId === currentUserId;
  
  // If in view-as mode, adjust the perspective
  if (isViewAsMode && viewAsUserId) {
    isCurrentUserMessage = senderId === viewAsUserId;
  }

  // Handle current user messages
  if (isCurrentUserMessage) {
    const displayName = isViewAsMode && viewAsUserId !== currentUserId ? 
      `You (as ${getNameFromUserId(viewAsUserId, partnerInfo)})` : 
      'You';
    
    return {
      name: displayName,
      shortName: 'You',
      initials: 'Y',
      isCurrentUser: true,
      isAdmin: false,
      role: 'current_user',
      fullDisplayName: displayName
    };
  }

  // Handle partner messages
  const partnerName = partnerInfo?.name || getNameFromUserId(senderId, partnerInfo) || 'Partner';
  const initials = getInitialsFromName(partnerName);
  
  return {
    name: partnerName,
    shortName: partnerName.split(' ')[0] || partnerName,
    initials,
    isCurrentUser: false,
    isAdmin: false,
    role: 'partner',
    fullDisplayName: partnerName
  };
};

/**
 * Get name from user ID (fallback when partnerInfo is not available)
 */
const getNameFromUserId = (userId: string, partnerInfo: PartnerInfo | null): string => {
  if (partnerInfo && partnerInfo.id === userId) {
    return partnerInfo.name;
  }
  
  // Fallback: try to extract name from email-like IDs
  if (userId.includes('@')) {
    const emailPart = userId.split('@')[0];
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
  }
  
  return 'User';
};

/**
 * Get initials from a full name
 */
const getInitialsFromName = (name: string): string => {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};

/**
 * Check if a user is currently viewing as another user (admin functionality)
 */
export const isInViewAsMode = (): boolean => {
  // This would typically check some global state or URL parameter
  // For now, we'll implement basic detection
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('viewAs') || urlParams.has('impersonate');
};

/**
 * Get the user ID that's being viewed as (if any)
 */
export const getViewAsUserId = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('viewAs') || urlParams.get('impersonate');
};
