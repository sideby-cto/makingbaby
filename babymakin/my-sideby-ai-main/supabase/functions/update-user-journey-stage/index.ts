import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { corsHeaders } from "./utils/corsHeaders.ts";
import { validateRequest, validateStages, validateEnvironment } from "./utils/validation.ts";
import { fetchValidStages } from "./services/stageConfigService.ts";
import { fetchUserProfile, updateUserStage, checkUserAlreadyInStage } from "./services/userProfileService.ts";
import { buildNoChangeResponse, buildSuccessResponse, buildErrorResponse } from "./utils/responseBuilder.ts";
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] ===== EDGE FUNCTION REQUEST START =====`);
  try {
    // Validate environment configuration
    const { supabaseUrl, supabaseKey } = validateEnvironment();
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Parse and validate request body
    let requestData;
    try {
      const requestBody = await req.json();
      console.log(`[${requestId}] Raw request body:`, requestBody);
      requestData = validateRequest(requestBody);
    } catch (error) {
      throw new Error(`Invalid JSON in request body: ${error.message}`);
    }
    const { userId, previousStage, newStage, adminId } = requestData;
    console.log(`[${requestId}] Parsed request details:`, {
      userId,
      previousStage,
      newStage,
      adminId,
      timestamp: new Date().toISOString()
    });
    // Fetch valid stages and validate request
    const validStages = await fetchValidStages(supabase, requestId);
    validateStages(previousStage, newStage, validStages, requestId);
    console.log(`[${requestId}] ===== VALIDATION PASSED =====`);
    // Fetch user profile
    const existingProfile = await fetchUserProfile(supabase, userId, requestId);
    // Check if user is already in target stage
    if (checkUserAlreadyInStage(existingProfile.journey_stage, newStage, requestId)) {
      const noChangeResponse = buildNoChangeResponse(userId, existingProfile.journey_stage, requestId, validStages);
      console.log(`[${requestId}] Returning no-change response:`, noChangeResponse);
      return new Response(JSON.stringify(noChangeResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Update user's journey stage
    const updatedProfile = await updateUserStage(supabase, userId, newStage, requestId);
    console.log(`[${requestId}] ===== OPERATION COMPLETED SUCCESSFULLY =====`);
    const successResponse = buildSuccessResponse(userId, existingProfile.journey_stage, newStage, updatedProfile, requestId, validStages);
    console.log(`[${requestId}] Returning success response:`, successResponse);
    return new Response(JSON.stringify(successResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error(`[${requestId}] ===== ERROR IN EDGE FUNCTION =====`);
    console.error(`[${requestId}] Error details:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    const errorResponse = buildErrorResponse(error, requestId);
    console.log(`[${requestId}] Returning error response:`, errorResponse);
    return new Response(JSON.stringify(errorResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
