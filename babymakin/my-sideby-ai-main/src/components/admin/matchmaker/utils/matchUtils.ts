
import { Json } from "@/integrations/supabase/types";
import { Match, RawMatch, RawUser } from "../types/matches";
import { supabase } from "@/integrations/supabase/client";

/**
 * Process subject statuses from a variety of formats
 */
export const processSubjectStatuses = (statuses: Json | null): Array<{name: string; status: string}> | null => {
  if (!statuses) return [];
  
  let processedStatuses: Array<{name: string; status: string}> = [];
  
  try {
    // Handle array of objects directly
    if (Array.isArray(statuses)) {
      return statuses.map(status => {
        if (status && typeof status === 'object' && 'name' in status && 'status' in status) {
          return {
            name: String(status.name || "unknown"),
            status: String(status.status || "unknown")
          };
        }
        return { name: "unknown", status: "unknown" };
      });
    }
    // Handle single object
    else if (statuses && typeof statuses === 'object') {
      return [{ 
        name: String(Object.keys(statuses)[0] || "unknown"), 
        status: String(Object.values(statuses)[0] || "unknown")
      }];
    }
    // Handle string (likely JSON)
    else if (typeof statuses === 'string') {
      try {
        const parsed = JSON.parse(statuses);
        if (Array.isArray(parsed)) {
          return parsed.map(p => ({
            name: String(p.name || "unknown"),
            status: String(p.status || "unknown")
          }));
        }
        return [{ name: "unknown", status: String(statuses) }];
      } catch (e) {
        return [{ name: "unknown", status: String(statuses) }];
      }
    }
  } catch (error) {
    console.error('Error processing subject statuses:', error, statuses);
    return [];
  }
  
  return processedStatuses.length > 0 ? processedStatuses : [];
};

/**
 * Transform raw match data with user information into the Match format
 */
export const transformMatchData = (
  matchData: RawMatch[], 
  usersMap: Map<string, RawUser>
): Match[] => {
  console.log('Transforming match data:', matchData.length, 'matches');
  
  return matchData.map((match) => {
    // Get user data with fallbacks
    const user1 = usersMap.get(match.user1_id);
    const user2 = usersMap.get(match.user2_id);
    
    // Flag to check if any users are deleted/missing
    const hasDeletedUsers = !user1 || !user2;
    
    // Process subject statuses for user1 with fallbacks
    let user1SubjectStatuses: Array<{name: string; status: string}> = [];
    if (user1 && user1.subject_statuses) {
      try {
        user1SubjectStatuses = processSubjectStatuses(user1.subject_statuses) || [];
      } catch (error) {
        console.error('Error processing user1 subject statuses:', error);
        user1SubjectStatuses = [];
      }
    }
    
    // Process subject statuses for user2 with fallbacks
    let user2SubjectStatuses: Array<{name: string; status: string}> = [];
    if (user2 && user2.subject_statuses) {
      try {
        user2SubjectStatuses = processSubjectStatuses(user2.subject_statuses) || [];
      } catch (error) {
        console.error('Error processing user2 subject statuses:', error);
        user2SubjectStatuses = [];
      }
    }
    
    // Create safe user objects that always have required properties
    const safeUser1 = {
      id: match.user1_id,
      first_name: user1?.first_name || 'User',
      last_name: user1?.last_name || 'Unavailable',
      email: user1?.email || null,
      bio: user1?.bio || null,
      teaching_experience: user1?.teaching_experience || null,
      subjects: user1?.subjects || null,
      certifications: user1?.certifications || null,
      avatar_url: user1?.avatar_url || null,
      created_at: user1?.created_at || '',
      updated_at: user1?.updated_at || '',
      subject_statuses: user1SubjectStatuses,
      approved_stance: user1?.approved_stance || null,
      status: user1?.status || 'deleted'
    };
    
    const safeUser2 = {
      id: match.user2_id,
      first_name: user2?.first_name || 'User',
      last_name: user2?.last_name || 'Unavailable',
      email: user2?.email || null,
      bio: user2?.bio || null,
      teaching_experience: user2?.teaching_experience || null,
      subjects: user2?.subjects || null,
      certifications: user2?.certifications || null,
      avatar_url: user2?.avatar_url || null,
      created_at: user2?.created_at || '',
      updated_at: user2?.updated_at || '',
      subject_statuses: user2SubjectStatuses,
      approved_stance: user2?.approved_stance || null,
      status: user2?.status || 'deleted'
    };
    
    return {
      id: match.id,
      rationale: match.rationale || "Manual match",
      created_at: match.created_at,
      email_sent_at: match.email_sent_at,
      status: match.status || "active",
      completion_notes: match.completion_notes,
      completed_at: match.completed_at,
      completed_by: match.completed_by,
      user1: safeUser1,
      user2: safeUser2,
      availability_slots: [],
      message_count: 0,
      hasDeletedUsers
    };
  });
};

/**
 * Fetch user details for a list of user IDs
 */
export const fetchUserDetails = async (userIds: Set<string>) => {
  try {
    console.log(`Fetching details for ${userIds.size} users`);
    
    if (userIds.size === 0) {
      return new Map();
    }
    
    // Convert Set to Array for the query
    const userIdsArray = Array.from(userIds);
    
    // Fetch in batches of 50 to avoid query size limits
    const batchSize = 50;
    const userBatches = [];
    
    for (let i = 0; i < userIdsArray.length; i += batchSize) {
      userBatches.push(userIdsArray.slice(i, i + batchSize));
    }
    
    const allUsersData = [];
    
    // Fetch each batch
    for (const batch of userBatches) {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          bio,
          teaching_experience,
          subjects,
          certifications,
          avatar_url,
          created_at,
          updated_at,
          subject_statuses,
          approved_stance,
          primary_flow_activity,
          has_completed_reflection,
          status
        `)
        .in('id', batch);

      if (usersError) {
        console.error('Users batch fetch error:', usersError);
        continue; // Continue with other batches
      }

      if (usersData) {
        allUsersData.push(...usersData);
      }
    }

    console.log('Fetched user details:', allUsersData.length || 0);

    // Create a map from the array
    return new Map(allUsersData.map(user => [user.id, user]));
  } catch (error) {
    console.error('Error in fetchUserDetails:', error);
    // Return an empty map so we can still render something
    return new Map();
  }
};

/**
 * Build a query for fetching matches
 */
export const buildMatchesQuery = () => {
  console.log('Building matches query');
  return supabase
    .from('matches')
    .select(`
      id,
      rationale,
      created_at,
      email_sent_at,
      status,
      completion_notes,
      completed_at,
      completed_by,
      user1_id,
      user2_id
    `)
    .order('created_at', { ascending: false });
};

/**
 * Filter matches by community if a community is selected
 */
export const filterMatchesByCommunity = async (query: any, selectedCommunity?: string) => {
  if (!selectedCommunity) {
    return query;
  }

  console.log('Filtering matches by community:', selectedCommunity);
  
  try {
    const { data: communityUsers, error } = await supabase
      .from('user_pacing_preferences')
      .select('user_id')
      .eq('community_id', selectedCommunity);

    if (error) {
      console.error('Error fetching community users:', error);
      return query; // Return unfiltered query on error
    }

    console.log('Found community users:', communityUsers?.length || 0);

    if (communityUsers && communityUsers.length > 0) {
      const userIds = communityUsers.map(u => u.user_id);
      // Use a safer approach to build the filter
      return query.or(
        `user1_id.in.(${userIds.join(',')}),user2_id.in.(${userIds.join(',')})`
      );
    }
  } catch (err) {
    console.error('Error in filterMatchesByCommunity:', err);
  }

  return query;
};
