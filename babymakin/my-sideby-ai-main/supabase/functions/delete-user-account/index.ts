import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Handle CORS preflight requests
function handleCorsPreflightRequest(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  return null;
}
// Create JSON response with CORS headers
function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
// Create error response with CORS headers
function createErrorResponse(error, status = 500) {
  console.error(`Error (${status}):`, error);
  return new Response(JSON.stringify({
    error: error.message || error.toString() || "An error occurred"
  }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
// Helper function to safely execute a database operation
async function safeExecute(operation, entityName) {
  try {
    await operation();
    return {
      success: true
    };
  } catch (error) {
    // Check if this is a "relation does not exist" error (PostgreSQL error code 42P01)
    if (error?.code === '42P01') {
      console.log(`Table for ${entityName} doesn't exist, skipping: ${error.message}`);
      return {
        success: true
      }; // Not an actual error for our purposes
    }
    console.error(`Error processing ${entityName}:`, error);
    return {
      success: false,
      error: `Error with ${entityName}: ${error.message || "unknown error"}`
    };
  }
}
// Main handler for the delete-user-account function
Deno.serve(async (req)=>{
  try {
    // Handle CORS preflight
    const corsResponse = handleCorsPreflightRequest(req);
    if (corsResponse) return corsResponse;
    // Only allow POST method
    if (req.method !== 'POST') {
      return createErrorResponse(new Error('Method not allowed'), 405);
    }
    // Parse the request body
    const { userId, requestFullDeletion = false, waitForCompletion = false } = await req.json();
    if (!userId) {
      return createErrorResponse(new Error('User ID is required'), 400);
    }
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return createErrorResponse(new Error('Missing environment variables'), 500);
    }
    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`Starting deletion process for user: ${userId}`);
    console.log(`Full deletion: ${requestFullDeletion}, Wait for completion: ${waitForCompletion}`);
    // Get user email for logging
    let userEmail = "";
    try {
      const { data: userData, error: userError } = await supabase.from('profiles').select('email').eq('id', userId).single();
      if (userError) {
        console.error('Error fetching user email:', userError);
      } else if (userData) {
        userEmail = userData.email || "";
        console.log(`Processing deletion for ${userEmail}`);
      }
    } catch (error) {
      console.warn('Could not fetch user email for logging purposes:', error);
    // Continue with deletion since this is just for logging
    }
    // Find match IDs involving this user
    const matchIds = [];
    try {
      const { data: matchData } = await supabase.from('matches').select('id').or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      if (matchData && matchData.length > 0) {
        matchData.forEach((m)=>matchIds.push(m.id));
        console.log(`Found ${matchIds.length} matches to clean up`);
      }
    } catch (error) {
      console.warn('Error finding matches:', error);
    }
    // Process tables in a specific order to respect foreign key constraints
    const results = [];
    // ---- 1. First, clean up match-related data (most critical) ----
    console.log("Step 1: Cleaning up match-related data");
    // Clean up match-related records first
    for (const matchId of matchIds){
      // Delete match messages
      results.push(await safeExecute(async ()=>{
        await supabase.from('match_scheduling_messages').delete().eq('match_id', matchId);
      }, 'match_scheduling_messages'));
      // Delete match admin messages
      results.push(await safeExecute(async ()=>{
        await supabase.from('match_admin_messages').delete().eq('match_id', matchId);
      }, 'match_admin_messages'));
      // Delete match meeting times
      results.push(await safeExecute(async ()=>{
        await supabase.from('match_meeting_times').delete().eq('match_id', matchId);
      }, 'match_meeting_times'));
      // Delete match conversation analysis
      results.push(await safeExecute(async ()=>{
        await supabase.from('match_conversation_analysis').delete().eq('match_id', matchId);
      }, 'match_conversation_analysis'));
    }
    // Now delete the matches themselves
    if (matchIds.length > 0) {
      results.push(await safeExecute(async ()=>{
        await supabase.from('matches').delete().in('id', matchIds);
      }, 'matches'));
    }
    // ---- 2. Handle user's relationship data ----
    console.log("Step 2: Cleaning up user relationship data");
    // Tables that directly reference the user
    const userTables = [
      {
        name: 'community_members',
        key: 'user_id'
      },
      {
        name: 'user_roles',
        key: 'user_id'
      },
      {
        name: 'user_pacing_preferences',
        key: 'user_id'
      },
      {
        name: 'user_tools',
        key: 'user_id'
      },
      {
        name: 'profile_experiments',
        key: 'user_id'
      },
      {
        name: 'connections',
        key: 'user_id'
      },
      {
        name: 'connections',
        key: 'connected_user_id'
      },
      {
        name: 'notifications',
        key: 'user_id'
      },
      {
        name: 'pending_notifications',
        key: 'user_id'
      },
      {
        name: 'comments',
        key: 'user_id'
      },
      {
        name: 'post_visibility',
        key: 'created_by'
      },
      {
        name: 'saved_items',
        key: 'user_id'
      },
      {
        name: 'engagement_logs',
        key: 'user_id'
      },
      {
        name: 'engagement_stats',
        key: 'user_id'
      },
      {
        name: 'event_participants',
        key: 'user_id'
      },
      {
        name: 'upduo_transcripts',
        key: 'user_id'
      },
      {
        name: 'user_custom_tools',
        key: 'user_id'
      },
      {
        name: 'user_availability',
        key: 'user_id'
      },
      {
        name: 'values_acknowledgment',
        key: 'id',
        idIsUserId: true
      }
    ];
    // Process tables one by one
    for (const table of userTables){
      const key = table.key;
      const idValue = table.idIsUserId ? userId : undefined;
      results.push(await safeExecute(async ()=>{
        await supabase.from(table.name).delete().eq(key, idValue || userId);
      }, table.name));
      // If we need to wait for completion, add a small delay to allow database to process
      if (waitForCompletion) {
        await new Promise((resolve)=>setTimeout(resolve, 100));
      }
    }
    // ---- 3. Handle posts (anonymize instead of delete) ----
    console.log("Step 3: Anonymizing user posts");
    try {
      const { data: postsData, error: postsError } = await supabase.from('posts').update({
        user_id: null,
        status: 'deleted'
      }).eq('user_id', userId);
      if (postsError) {
        console.warn('Error anonymizing posts:', postsError);
        results.push({
          table: 'posts',
          success: false,
          error: postsError.message
        });
      } else {
        results.push({
          table: 'posts',
          success: true
        });
      }
      // If we need to wait for completion, add a delay
      if (waitForCompletion) {
        await new Promise((resolve)=>setTimeout(resolve, 200));
      }
    } catch (error) {
      console.warn('Exception anonymizing posts:', error);
      results.push({
        table: 'posts',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    // ---- 4. External service cleanup ----
    console.log("Step 4: Cleaning up external service data");
    // Call the Upduo removal function to clean up external service data
    try {
      const { data: upduoData, error: upduoError } = await supabase.functions.invoke('remove-from-upduo', {
        body: {
          userId,
          fullCleanup: true // Request complete removal from Upduo
        }
      });
      if (upduoError) {
        console.warn('Error removing from Upduo:', upduoError);
        results.push({
          service: 'upduo',
          success: false,
          error: upduoError.message
        });
      } else {
        results.push({
          service: 'upduo',
          success: true
        });
      }
    } catch (error) {
      console.warn('Exception removing from Upduo:', error);
      results.push({
        service: 'upduo',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    // ---- 5. Finally delete the profile ----
    console.log("Step 5: Deleting user profile");
    let profileDeleted = false;
    try {
      // Wait a moment for any concurrent operations to complete
      await new Promise((resolve)=>setTimeout(resolve, waitForCompletion ? 300 : 100));
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
      if (profileError) {
        console.error('Error deleting profile:', profileError);
        results.push({
          table: 'profiles',
          success: false,
          error: profileError.message
        });
      } else {
        profileDeleted = true;
        results.push({
          table: 'profiles',
          success: true
        });
      }
    } catch (error) {
      console.error('Exception deleting profile:', error);
      results.push({
        table: 'profiles',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    // ---- 6. Delete the auth user (if requested) ----
    let authUserDeleted = false;
    if (requestFullDeletion && profileDeleted) {
      console.log("Step 6: Deleting auth user");
      try {
        // Wait a moment for profile deletion to complete
        await new Promise((resolve)=>setTimeout(resolve, waitForCompletion ? 300 : 100));
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
        if (authDeleteError) {
          console.error('Error deleting auth user:', authDeleteError);
          results.push({
            service: 'auth',
            success: false,
            error: authDeleteError.message
          });
        } else {
          authUserDeleted = true;
          results.push({
            service: 'auth',
            success: true
          });
        }
      } catch (error) {
        console.error('Exception deleting auth user:', error);
        results.push({
          service: 'auth',
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    // Determine overall success
    const hasErrors = results.some((r)=>!r.success);
    const partialSuccess = hasErrors && profileDeleted;
    const fullSuccess = profileDeleted && (!requestFullDeletion || authUserDeleted);
    if (fullSuccess) {
      console.log('User successfully deleted from all systems');
      return createJsonResponse({
        success: true,
        message: 'Account and all associated data successfully deleted',
        results
      });
    } else if (partialSuccess) {
      console.log('User partially deleted (profile removed but some data remains)');
      return createJsonResponse({
        success: false,
        partialSuccess: true,
        message: 'Account data partially deleted. Some related records could not be removed.',
        results
      }, 207);
    } else {
      console.log('User deletion failed (profile not removed)');
      return createJsonResponse({
        success: false,
        message: 'Failed to delete user profile. No changes were made.',
        results
      }, 400);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return createErrorResponse(error, 500);
  }
});
