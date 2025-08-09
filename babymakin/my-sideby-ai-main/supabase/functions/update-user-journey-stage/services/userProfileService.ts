export const fetchUserProfile = async (supabase, userId, requestId)=>{
  console.log(`[${requestId}] Fetching user profile for user: ${userId}`);
  const { data: existingProfile, error: fetchError } = await supabase.from('profiles').select('id, journey_stage, email, first_name, last_name').eq('id', userId).single();
  if (fetchError) {
    console.error(`[${requestId}] Error fetching user profile:`, fetchError);
    throw new Error(`Failed to fetch user profile: ${fetchError.message}`);
  }
  if (!existingProfile) {
    console.error(`[${requestId}] User ${userId} not found`);
    throw new Error(`User ${userId} not found`);
  }
  console.log(`[${requestId}] Current user profile:`, {
    email: existingProfile.email,
    currentStage: existingProfile.journey_stage,
    firstName: existingProfile.first_name,
    lastName: existingProfile.last_name
  });
  return existingProfile;
};
export const updateUserStage = async (supabase, userId, newStage, requestId)=>{
  console.log(`[${requestId}] ===== UPDATING USER PROFILE =====`);
  console.log(`[${requestId}] Updating user profile: journey_stage -> ${newStage}`);
  const { data: updatedProfile, error: updateError } = await supabase.from('profiles').update({
    journey_stage: newStage,
    updated_at: new Date().toISOString()
  }).eq('id', userId).select('journey_stage, updated_at').single();
  if (updateError) {
    console.error(`[${requestId}] Error updating user stage:`, updateError);
    throw new Error(`Failed to update user stage: ${updateError.message}`);
  }
  console.log(`[${requestId}] Profile update successful:`, updatedProfile);
  if (updatedProfile?.journey_stage !== newStage) {
    console.error(`[${requestId}] Stage update verification failed. Expected: ${newStage}, Got: ${updatedProfile?.journey_stage}`);
    throw new Error(`Stage update verification failed`);
  }
  return updatedProfile;
};
export const checkUserAlreadyInStage = (currentStage, targetStage, requestId)=>{
  if (currentStage === targetStage) {
    console.log(`[${requestId}] User already in target stage ${targetStage}, no update needed`);
    return true;
  }
  return false;
};
