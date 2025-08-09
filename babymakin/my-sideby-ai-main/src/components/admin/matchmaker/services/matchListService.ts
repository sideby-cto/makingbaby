import { supabase } from "@/integrations/supabase/client";

export const fetchMatchesData = async () => {
  console.log("🔍 Fetching matches from database...");
  
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      user1_id,
      user2_id,
      status,
      rationale,
      created_at,
      created_by,
      completed_at,
      completion_notes,
      completed_by,
      upduo_session_id,
      upduo_session_name,
      email_sent_at
    `)
    .order('created_at', { ascending: false }); // Most recent first

  if (error) {
    console.error("❌ Error fetching matches:", error);
    throw error;
  }

  console.log(`✅ Successfully fetched ${data?.length || 0} matches`);
  return data || [];
};

export const fetchAvailabilitySlots = async () => {
  console.log("🔍 Fetching availability slots...");
  
  const { data, error } = await supabase
    .from('user_availability')
    .select(`
      id,
      user_id,
      time_slots,
      pacing_level,
      created_at,
      updated_at
    `);

  if (error) {
    console.error("❌ Error fetching availability:", error);
    throw error;
  }

  console.log(`✅ Successfully fetched ${data?.length || 0} availability records`);
  return data || [];
};

export const fetchMessageCounts = async () => {
  console.log("🔍 Fetching message counts...");
  
  const { data, error } = await supabase
    .from('match_scheduling_messages')
    .select('match_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ Error fetching message counts:", error);
    throw error;
  }

  // Count messages per match
  const messageCounts = (data || []).reduce((acc: Record<string, number>, msg) => {
    acc[msg.match_id] = (acc[msg.match_id] || 0) + 1;
    return acc;
  }, {});

  const countArray = Object.entries(messageCounts).map(([match_id, count]) => ({
    match_id,
    count
  }));

  console.log(`✅ Successfully calculated message counts for ${countArray.length} matches`);
  return countArray;
};

export const fetchUsersData = async (userIds: string[]) => {
  console.log(`🔍 Fetching user data for ${userIds.length} users...`);
  
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      avatar_url,
      status,
      created_at,
      bio,
      location,
      primary_flow_activity,
      approved_stance,
      subject_statuses,
      onboarding_completed,
      journey_stage
    `)
    .in('id', userIds);

  if (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  }

  console.log(`✅ Successfully fetched ${data?.length || 0} user profiles`);
  return data || [];
};
