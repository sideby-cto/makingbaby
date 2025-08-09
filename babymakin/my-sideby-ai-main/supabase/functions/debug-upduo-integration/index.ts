import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email } = await req.json()
    
    if (action === 'check_status' && email) {
      // Check integration status for a specific user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, upduo_status, upduo_error, metadata')
        .eq('email', email)
        .maybeSingle()

      if (profileError) {
        throw new Error(`Profile query error: ${profileError.message}`)
      }

      if (!profile) {
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        )
      }

      // Get integration logs for this user
      const { data: logs, error: logsError } = await supabase
        .from('upduo_integration_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (logsError) {
        console.error('Error fetching logs:', logsError)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          profile: {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            upduo_status: profile.upduo_status,
            upduo_error: profile.upduo_error,
            crew_code: profile.metadata?.crew_code
          },
          logs: logs || []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'list_failed_users') {
      // List users with failed integration status
      const { data: failedUsers, error: failedError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, upduo_status, upduo_error, created_at')
        .eq('upduo_status', 'failed')
        .order('created_at', { ascending: false })
        .limit(50)

      if (failedError) {
        throw new Error(`Failed users query error: ${failedError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          failed_users: failedUsers || []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'list_pending_users') {
      // List users with pending integration status
      const { data: pendingUsers, error: pendingError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, upduo_status, created_at')
        .eq('upduo_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)

      if (pendingError) {
        throw new Error(`Pending users query error: ${pendingError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          pending_users: pendingUsers || []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'integration_summary') {
      // Get overall integration status summary
      const { data: statusCounts, error: statusError } = await supabase
        .from('profiles')
        .select('upduo_status')

      if (statusError) {
        throw new Error(`Status summary query error: ${statusError.message}`)
      }

      const summary = {
        total_users: statusCounts?.length || 0,
        success: statusCounts?.filter(u => u.upduo_status === 'success').length || 0,
        failed: statusCounts?.filter(u => u.upduo_status === 'failed').length || 0,
        pending: statusCounts?.filter(u => u.upduo_status === 'pending').length || 0,
        null_status: statusCounts?.filter(u => !u.upduo_status).length || 0
      }

      // Get recent logs
      const { data: recentLogs, error: logsError } = await supabase
        .from('upduo_integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (logsError) {
        console.error('Error fetching recent logs:', logsError)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          summary,
          recent_logs: recentLogs || []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid action. Supported actions: check_status, list_failed_users, list_pending_users, integration_summary' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Debug Upduo integration error:', error)
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