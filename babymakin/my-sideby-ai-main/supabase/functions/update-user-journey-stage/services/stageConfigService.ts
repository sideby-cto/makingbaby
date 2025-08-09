export const fetchValidStages = async (supabase, requestId)=>{
  console.log(`[${requestId}] ===== FETCHING VALID STAGES =====`);
  const { data: validStagesData, error: stagesError } = await supabase.from('journey_stage_config').select('stage').is('deleted_at', null);
  if (stagesError) {
    console.error(`[${requestId}] Error fetching valid stages:`, stagesError);
    throw new Error(`Failed to fetch valid stages: ${stagesError.message}`);
  }
  const validStages = validStagesData?.map((row)=>row.stage) || [];
  console.log(`[${requestId}] Valid stages from database:`, validStages);
  if (validStages.length === 0) {
    console.warn(`[${requestId}] No stages found in journey_stage_config, using fallback defaults`);
    return [
      'new',
      'reflection_completed',
      'matched',
      'scheduled',
      'conversation',
      'active',
      'inactive'
    ];
  }
  return validStages;
};
export const fetchStageConfigs = async (supabase, requestId)=>{
  console.log(`[${requestId}] Fetching stage configurations`);
  const { data: stageConfigs, error } = await supabase.from('journey_stage_config').select('stage, label, display_order').is('deleted_at', null).order('display_order');
  if (error) {
    console.error(`[${requestId}] Error fetching stage configs:`, error);
    throw new Error(`Failed to fetch stage configurations: ${error.message}`);
  }
  return stageConfigs || [];
};
