import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

// Team member IDs from the database query results
const TEAM_MEMBERS = [
  { id: 'f79ffe36-4f02-4ba8-a359-b9bd8963cbd1', name: 'Erica Crane', email: 'erica@sideby.ai' },
  { id: 'ea155ac4-eb3a-4e24-a4be-84f0143f4348', name: 'Michael Mendelson', email: 'mike@sideby.ai' },
  { id: '3a405724-5668-4c9b-a47d-125f4cd82c15', name: 'Kippy Smith', email: 'kippy@sideby.ai' },
  { id: '6f8a135f-2d10-410d-98bb-ca70c39b62c9', name: 'Rohan Sinha', email: 'scholar@sideby.ai' }
];

/**
 * Check if this is the user's first reflection completion
 */
export async function isFirstReflectionCompletion(userId: string): Promise<boolean> {
  try {
    // Check if user already has a team member match
    const { data: existingMatches, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .in('user2_id', TEAM_MEMBERS.map(tm => tm.id))
      .in('user1_id', TEAM_MEMBERS.map(tm => tm.id))
      .maybeSingle();

    if (matchError) {
      console.error('Error checking existing team member matches:', matchError);
      return false;
    }

    if (existingMatches) {
      console.log(`User ${userId} already has a team member match`);
      return false;
    }

    // Check if user just completed their reflection (has reflection quality score >= 75)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('has_completed_reflection, journey_stage, reflection_quality_score')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return false;
    }

    // This is a first reflection completion if:
    // 1. User has completed reflection (quality score >= 75)
    // 2. User is still in 'new' or 'reflection_completed' stage (hasn't been matched yet)
    const isFirstCompletion = profileData.has_completed_reflection && 
                             profileData.reflection_quality_score >= 75 &&
                             (profileData.journey_stage === 'new' || profileData.journey_stage === 'reflection_completed');

    console.log(`First reflection check for user ${userId}:`, {
      has_completed_reflection: profileData.has_completed_reflection,
      journey_stage: profileData.journey_stage,
      reflection_quality_score: profileData.reflection_quality_score,
      isFirstCompletion
    });

    return isFirstCompletion;
  } catch (error) {
    console.error('Error in isFirstReflectionCompletion:', error);
    return false;
  }
}

/**
 * Select the best available team member using rotation system
 */
export async function selectTeamMember(): Promise<string | null> {
  try {
    // Get match counts for each team member to distribute evenly
    const teamMemberMatchCounts = await Promise.all(
      TEAM_MEMBERS.map(async (member) => {
        const { data: matches, error } = await supabaseAdmin
          .from('matches')
          .select('id')
          .or(`user1_id.eq.${member.id},user2_id.eq.${member.id}`)
          .eq('status', 'active');

        if (error) {
          console.error(`Error counting matches for ${member.name}:`, error);
          return { ...member, matchCount: 0 };
        }

        return { ...member, matchCount: matches?.length || 0 };
      })
    );

    // Sort by match count (ascending) to get the team member with least matches
    teamMemberMatchCounts.sort((a, b) => a.matchCount - b.matchCount);

    const selectedMember = teamMemberMatchCounts[0];
    console.log('Team member selection:', {
      selected: selectedMember.name,
      matchCounts: teamMemberMatchCounts.map(tm => ({ name: tm.name, count: tm.matchCount }))
    });

    return selectedMember.id;
  } catch (error) {
    console.error('Error in selectTeamMember:', error);
    return null;
  }
}

/**
 * Create an automatic match with a team member
 */
export async function createTeamMemberMatch(userId: string, teamMemberId: string): Promise<boolean> {
  try {
    console.log(`Creating team member match: user ${userId} with team member ${teamMemberId}`);

    // Create the match
    const { data: matchData, error: matchError } = await supabaseAdmin
      .from('matches')
      .insert({
        user1_id: userId,
        user2_id: teamMemberId,
        status: 'active',
        created_by: teamMemberId, // Team member is the creator
        rationale: 'Automatic team member match after first reflection completion'
      })
      .select()
      .single();

    if (matchError) {
      console.error('Error creating team member match:', matchError);
      return false;
    }

    console.log(`Successfully created team member match: ${matchData.id}`);

    // Update user's journey stage to 'matched'
    const { error: journeyError } = await supabaseAdmin
      .from('profiles')
      .update({ journey_stage: 'matched' })
      .eq('id', userId);

    if (journeyError) {
      console.error('Error updating user journey stage:', journeyError);
      // Don't fail the whole operation if journey stage update fails
    } else {
      console.log(`Updated user ${userId} journey stage to 'matched'`);
    }

    // Send match notification emails (call the existing edge function)
    try {
      await supabaseAdmin.functions.invoke('send-match-email', {
        body: {
          matchId: matchData.id,
          user1Id: userId,
          user2Id: teamMemberId,
          isTeamMemberMatch: true
        }
      });
      console.log('Match notification emails triggered');
    } catch (emailError) {
      console.error('Error sending match notification emails:', emailError);
      // Don't fail the operation if email sending fails
    }

    return true;
  } catch (error) {
    console.error('Error in createTeamMemberMatch:', error);
    return false;
  }
}

/**
 * Process automatic team member matching for first-time reflection completion
 */
export async function processFirstReflectionTeamMatch(userId: string): Promise<void> {
  try {
    console.log(`Processing first reflection team match for user ${userId}`);

    // Check if this is a first reflection completion
    const isFirstCompletion = await isFirstReflectionCompletion(userId);
    if (!isFirstCompletion) {
      console.log(`User ${userId} is not eligible for first reflection team match`);
      return;
    }

    // Select the best available team member
    const teamMemberId = await selectTeamMember();
    if (!teamMemberId) {
      console.error('No team member available for matching');
      return;
    }

    // Create the match
    const success = await createTeamMemberMatch(userId, teamMemberId);
    if (success) {
      console.log(`Successfully created automatic team member match for user ${userId}`);
    } else {
      console.error(`Failed to create automatic team member match for user ${userId}`);
    }
  } catch (error) {
    console.error('Error in processFirstReflectionTeamMatch:', error);
  }
}