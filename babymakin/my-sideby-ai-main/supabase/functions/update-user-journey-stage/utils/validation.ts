export const validateRequest = (requestBody)=>{
  const { userId, previousStage, newStage, adminId } = requestBody;
  if (!userId) {
    throw new Error('userId is required');
  }
  if (!newStage) {
    throw new Error('newStage is required');
  }
  if (!previousStage) {
    throw new Error('previousStage is required');
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new Error(`Invalid userId format: ${userId}`);
  }
  return {
    userId,
    previousStage,
    newStage,
    adminId
  };
};
export const validateStages = (previousStage, newStage, validStages, requestId)=>{
  if (!validStages.includes(newStage)) {
    const errorMsg = `Invalid newStage: ${newStage}. Valid stages from database: ${validStages.join(', ')}`;
    console.error(`[${requestId}] Stage validation failed:`, errorMsg);
    throw new Error(errorMsg);
  }
  if (!validStages.includes(previousStage)) {
    const errorMsg = `Invalid previousStage: ${previousStage}. Valid stages from database: ${validStages.join(', ')}`;
    console.error(`[${requestId}] Stage validation failed:`, errorMsg);
    throw new Error(errorMsg);
  }
};
export const validateEnvironment = ()=>{
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  return {
    supabaseUrl,
    supabaseKey
  };
};
