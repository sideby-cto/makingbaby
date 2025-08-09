
import { Profile } from "../types/matchmaking";

/**
 * Returns a consistent display name for a profile, using fallbacks if needed
 */
export const getDisplayName = (profile: Profile): string => {
  // If we have both first and last name, use them
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  
  // If we only have first name
  if (profile.first_name) {
    return profile.first_name;
  }
  
  // If we only have last name
  if (profile.last_name) {
    return profile.last_name;
  }
  
  // Use email if we have it
  if (profile.email) {
    // Return email up to @ symbol if possible
    const emailName = profile.email.split('@')[0];
    return emailName || profile.email;
  }
  
  // Last resort
  return profile.id ? `User ${profile.id.slice(0, 8)}` : "Unknown User";
};

/**
 * Converts any profile-like object to a matchmaking Profile
 */
export const toMatchmakingProfile = (profile: any): Profile => {
  return {
    id: profile.id || '',
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    email: profile.email || '',
    avatar_url: profile.avatar_url || null,
    ...profile
  };
};
