
import { Profile } from "../types/matchmaking";

interface FilterOptions {
  showAdminUsers: boolean;
  showOnlyReflectionCompleted: boolean;
  showOnlyUnmatched: boolean;
  debouncedSearchTerm: string;
}

export const filterProfiles = (profiles: Profile[], options: FilterOptions): Profile[] => {
  const { showAdminUsers, showOnlyReflectionCompleted, showOnlyUnmatched, debouncedSearchTerm } = options;

  return profiles.filter(profile => {
    // Check if we should filter out admin users
    const isAdmin = profile.metadata?.is_admin === true || profile.email?.endsWith('@sideby.ai');
    if (isAdmin && !showAdminUsers) {
      return false;
    }

    // Filter by reflection status if enabled
    if (showOnlyReflectionCompleted && !profile.has_completed_reflection) {
      return false;
    }

    // Filter by match status if enabled
    if (showOnlyUnmatched && (profile.count_matches || 0) > 0) {
      return false;
    }
    
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    const firstName = profile.first_name?.toLowerCase() || "";
    const lastName = profile.last_name?.toLowerCase() || "";
    const email = profile.email?.toLowerCase() || "";
    
    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      email.includes(searchLower) ||
      `${firstName} ${lastName}`.includes(searchLower)
    );
  });
};
