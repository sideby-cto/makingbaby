export const buildNoChangeResponse = (userId, currentStage, requestId, validStages)=>{
  return {
    success: true,
    message: `User already in stage ${currentStage}`,
    userId,
    previousStage: currentStage,
    newStage: currentStage,
    verifiedStage: currentStage,
    updatedAt: new Date().toISOString(),
    requestId,
    timestamp: new Date().toISOString(),
    validStagesUsed: validStages,
    changed: false
  };
};
export const buildSuccessResponse = (userId, previousStage, newStage, updatedProfile, requestId, validStages)=>{
  return {
    success: true,
    message: `User stage updated from ${previousStage} to ${newStage}`,
    userId,
    previousStage,
    newStage,
    verifiedStage: updatedProfile.journey_stage,
    updatedAt: updatedProfile.updated_at,
    requestId,
    timestamp: new Date().toISOString(),
    validStagesUsed: validStages,
    changed: true
  };
};
export const buildErrorResponse = (error, requestId)=>{
  return {
    success: false,
    error: error.message || 'Unknown error occurred',
    requestId,
    timestamp: new Date().toISOString()
  };
};
