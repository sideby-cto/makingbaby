import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { userId, transcript, sessionTitle } = await req.json();
    console.log('Received request with:', {
      userId,
      sessionTitle,
      transcriptLength: transcript?.length
    });
    if (!userId || !transcript || !sessionTitle) {
      throw new Error('Missing required parameters: userId, transcript, and sessionTitle are required');
    }
    const messages = transcript.map((entry)=>`${entry.speaker}: ${entry.text}`).join('\n');
    const prompt = `
    Based on this welcome session transcript, identify this person's primary flow activity - the thing they do for fun most outside of their profession. 
    Only return the activity itself, nothing else. If you can't determine it with high confidence, return "unknown".
    
    Transcript:
    ${messages}`;
    console.log('Calling OpenAI for analysis...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing conversations to identify people's interests and hobbies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    const result = await openAIResponse.json();
    const flowActivity = result.choices[0].message.content.trim();
    console.log('Flow activity extracted:', flowActivity);
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    let targetUserId = userId;
    let hasValidUuid = false;
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userId)) {
        hasValidUuid = true;
      } else {
        console.log(`Non-UUID format user ID provided: ${userId}, checking for mappings`);
        const { data: mappingData, error: mappingError } = await supabaseAdmin.from('upduo_user_mappings').select('sideby_user_id').eq('upduo_user_id', userId.toString()).maybeSingle();
        if (mappingError) {
          console.log('Error finding user mapping:', mappingError);
          // Check if there are any valid users in the system as a fallback
          const { data: anyUser, error: anyUserError } = await supabaseAdmin.from('profiles').select('id').not('status', 'eq', 'deleted').limit(1);
          if (!anyUserError && anyUser && anyUser.length > 0) {
            console.log(`Using fallback user: ${anyUser[0].id}`);
            targetUserId = anyUser[0].id;
            hasValidUuid = true;
            // Create a mapping for future reference
            const { error: createMappingError } = await supabaseAdmin.from('upduo_user_mappings').insert({
              upduo_user_id: userId.toString(),
              sideby_user_id: targetUserId
            });
            if (createMappingError) {
              console.log('Error creating fallback mapping:', createMappingError);
            }
          }
        } else if (mappingData?.sideby_user_id) {
          targetUserId = mappingData.sideby_user_id;
          hasValidUuid = true;
          console.log(`Found mapping: Upduo user ${userId} → sideby user ${targetUserId}`);
        } else {
          console.log(`No mapping found for Upduo user ${userId}`);
        }
      }
      console.log('Target user ID for storing flow activity:', targetUserId, 'Valid UUID:', hasValidUuid);
      if (hasValidUuid) {
        try {
          const { error: tableCheckError } = await supabaseAdmin.from('user_flow_activities').select('count').limit(1);
          if (tableCheckError && tableCheckError.code === '42P01') {
            const createTableQuery = `
              CREATE TABLE IF NOT EXISTS public.user_flow_activities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                session_id TEXT NOT NULL,
                flow_activity TEXT,
                confidence DOUBLE PRECISION,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
              );
              CREATE INDEX IF NOT EXISTS idx_user_flow_activities_user_id ON public.user_flow_activities(user_id);
            `;
            await supabaseAdmin.rpc('exec', {
              query: createTableQuery
            });
            console.log("Created user_flow_activities table");
          }
        } catch (initError) {
          console.log("Error checking/creating table:", initError);
        }
        const { data: existingActivity, error: checkError } = await supabaseAdmin.from('user_flow_activities').select('*').eq('user_id', targetUserId).maybeSingle();
        if (checkError && checkError.code !== '42P01') {
          console.error('Error checking existing activity:', checkError);
        }
        const sessionId = crypto.randomUUID();
        const { error: insertError } = await supabaseAdmin.from('user_flow_activities').upsert({
          user_id: targetUserId,
          session_id: sessionId,
          flow_activity: flowActivity,
          confidence: flowActivity === 'unknown' ? 0.3 : 0.8
        });
        if (insertError) {
          console.error('Error storing flow activity:', insertError);
          throw insertError;
        }
        console.log('Flow activity stored successfully');
        try {
          if (flowActivity !== 'unknown') {
            // Create a hat detection record
            const hatDetectionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/create_hat_detection`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                p_user_id: targetUserId,
                p_hat_name: flowActivity,
                p_source: 'session_transcript',
                p_confidence: flowActivity === 'unknown' ? 0.3 : 0.8,
                p_session_id: sessionId,
                p_metadata: JSON.stringify({
                  method: 'extract-flow-activity',
                  session_title: sessionTitle
                })
              })
            });
            if (!hatDetectionResponse.ok) {
              const text = await hatDetectionResponse.text();
              console.error('Error creating hat detection:', text);
            } else {
              const detectionId = await hatDetectionResponse.json();
              console.log('Hat detection recorded with id:', detectionId);
            }
            // NEW: Automatically create a saved item (idea) for the user's flow activity
            const { data: savedItem, error: savedItemError } = await supabaseAdmin.from('saved_items').insert({
              user_id: targetUserId,
              type: 'idea',
              content: `I enjoy ${flowActivity} as a flow activity.`,
              source: 'auto_generated',
              metadata: {
                flow_activity: flowActivity,
                auto_generated: true,
                session_id: sessionId
              }
            }).select('id').single();
            if (savedItemError) {
              console.error('Error creating saved item:', savedItemError);
            } else {
              console.log('Flow activity saved as idea with ID:', savedItem.id);
            }
            // NEW: Create a post for the user to potentially approve their flow activity
            const { data: post, error: postError } = await supabaseAdmin.from('posts').insert({
              user_id: targetUserId,
              type: 'flow_activity',
              content: flowActivity,
              status: 'active',
              metadata: {
                flow_activity: {
                  activity: flowActivity,
                  confidence: flowActivity === 'unknown' ? 0.3 : 0.8,
                  session_id: sessionId
                }
              }
            }).select('id').single();
            if (postError) {
              console.error('Error creating flow activity post:', postError);
            } else {
              console.log('Flow activity post created with ID:', post.id);
            }
            // Update the user's profile with the detected flow activity if new
            if (!existingActivity && flowActivity !== 'unknown') {
              const { error: profileError } = await supabaseAdmin.from('profiles').update({
                primary_flow_activity: flowActivity
              }).eq('id', targetUserId);
              if (profileError) {
                console.error('Error updating primary flow activity:', profileError);
              }
            }
          }
        } catch (err) {
          console.error('Error inserting hat detection:', err);
        }
        return new Response(JSON.stringify({
          success: true,
          flowActivity,
          isNewActivity: !existingActivity
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } else {
        console.log('No valid UUID found and unable to create mapping');
        return new Response(JSON.stringify({
          success: false,
          error: `Could not determine a valid UUID for user ID: ${userId}`,
          errorType: 'InvalidUserId'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200 // Return 200 even though there was a logical error, to avoid breaking the client
        });
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorType: error.name
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
