
import { Match } from "../types/matches";

export const mapAvailabilityToMatches = (matchesData: any[], availabilityData: any[]) => {
  const availabilityByUser: Record<string, any[]> = {};
  
  availabilityData.forEach(avail => {
    if (!availabilityByUser[avail.user_id]) {
      availabilityByUser[avail.user_id] = [];
    }
    availabilityByUser[avail.user_id].push(avail);
  });

  const availabilityByMatch: Record<string, any[]> = {};
  
  matchesData.forEach(match => {
    const user1Availability = availabilityByUser[match.user1_id] || [];
    const user2Availability = availabilityByUser[match.user2_id] || [];
    availabilityByMatch[match.id] = [...user1Availability, ...user2Availability];
  });

  return availabilityByMatch;
};

export const transformMatchesData = (
  matchesData: any[], 
  usersData: any[], 
  availabilityByMatch: Record<string, any[]>, 
  messageCountByMatch: Record<string, number>
): Match[] => {
  const usersMap = new Map(usersData.map(user => [user.id, user]));

  return matchesData.map(match => {
    const user1 = usersMap.get(match.user1_id);
    const user2 = usersMap.get(match.user2_id);
    const createdBy = usersMap.get(match.created_by);
    const completedBy = match.completed_by ? usersMap.get(match.completed_by) : null;
    
    const availability = availabilityByMatch[match.id] || [];
    const messageCount = messageCountByMatch[match.id] || 0;

    // Log match transformation for debugging
    console.log(`🔄 Transforming match ${match.id}:`, {
      user1: user1 ? `${user1.first_name} ${user1.last_name}` : 'Unknown',
      user2: user2 ? `${user2.first_name} ${user2.last_name}` : 'Unknown',
      status: match.status,
      messageCount,
      hasDeletedUsers: !user1 || !user2 || user1.status === 'deleted' || user2.status === 'deleted'
    });

    // Transform availability data to match expected format
    const availabilitySlots = availability.flatMap(avail => {
      if (avail.time_slots && Array.isArray(avail.time_slots)) {
        return avail.time_slots.map((slot: any) => ({
          day: slot.day || '',
          hour: slot.hour || 0
        }));
      }
      return [];
    });

    return {
      id: match.id,
      user1: user1 || { 
        id: match.user1_id, 
        first_name: 'Unknown', 
        last_name: 'User', 
        email: '', 
        bio: null,
        teaching_experience: null,
        subjects: null,
        certifications: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject_statuses: null,
        approved_stance: null,
        status: 'deleted',
        primary_flow_activity: null,
        has_completed_reflection: false,
        pacing: null
      },
      user2: user2 || { 
        id: match.user2_id, 
        first_name: 'Unknown', 
        last_name: 'User', 
        email: '', 
        bio: null,
        teaching_experience: null,
        subjects: null,
        certifications: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject_statuses: null,
        approved_stance: null,
        status: 'deleted',
        primary_flow_activity: null,
        has_completed_reflection: false,
        pacing: null
      },
      status: match.status,
      rationale: match.rationale || '',
      created_at: match.created_at,
      email_sent_at: match.email_sent_at,
      completion_notes: match.completion_notes,
      completed_at: match.completed_at,
      completed_by: match.completed_by,
      availability_slots: availabilitySlots,
      message_count: messageCount,
      hasDeletedUsers: !user1 || !user2 || user1.status === 'deleted' || user2.status === 'deleted'
    };
  });
};
