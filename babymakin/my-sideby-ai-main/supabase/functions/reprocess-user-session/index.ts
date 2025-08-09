import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReprocessRequest {
  userId: string
  conversationId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, conversationId }: ReprocessRequest = await req.json()
    
    console.log(`Reprocessing session for user ${userId}, conversation ${conversationId}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check current reflection status
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('has_completed_reflection, has_partial_reflection')
      .eq('id', userId)
      .single()

    console.log('Current reflection status:', currentProfile)

    // Check if transcript exists
    const { data: existingTranscript } = await supabase
      .from('upduo_transcripts')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)
      .maybeSingle()

    console.log('Existing transcript:', existingTranscript ? 'Found' : 'Not found')

    // If transcript exists and has sufficient content, mark reflection as complete
    if (existingTranscript && existingTranscript.transcript && 
        Array.isArray(existingTranscript.transcript) && 
        existingTranscript.transcript.length > 0) {
      
      console.log(`Transcript has ${existingTranscript.transcript.length} entries`)
      
      // Update profile to mark reflection as complete
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          has_completed_reflection: true,
          has_partial_reflection: false 
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        throw updateError
      }

      console.log('Successfully marked reflection as complete')

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User reflection marked as complete',
          transcript_entries: existingTranscript.transcript.length,
          previous_status: currentProfile
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Try to call store-session-transcript function to create the transcript
      console.log('Attempting to store transcript via edge function')
      
      const { data: storeResult, error: storeError } = await supabase.functions
        .invoke('store-session-transcript', {
          body: {
            sessionId: conversationId,
            userId: userId,
            forceReprocess: true
          }
        })

      if (storeError) {
        console.error('Error calling store-session-transcript:', storeError)
        throw storeError
      }

      console.log('Store transcript result:', storeResult)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Triggered transcript storage',
          store_result: storeResult,
          previous_status: currentProfile
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

  } catch (error) {
    console.error('Error reprocessing session:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})