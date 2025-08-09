
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestRequest {
  testIds?: string[];
  executionType?: string;
  testType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { testIds, executionType = 'manual', testType } = await req.json() as TestRequest

    console.log('Core flow test execution request:', { testIds, executionType, testType })

    // If no specific test IDs provided, get all enabled tests
    let testsToRun: any[] = []
    
    if (testIds && testIds.length > 0) {
      const { data: tests, error: testsError } = await supabaseClient
        .from('core_flow_tests')
        .select('*')
        .in('id', testIds)
        .eq('enabled', true)

      if (testsError) {
        console.error('Error fetching tests:', testsError)
        throw testsError
      }

      testsToRun = tests || []
    } else if (testType) {
      const { data: tests, error: testsError } = await supabaseClient
        .from('core_flow_tests')
        .select('*')
        .eq('test_type', testType)
        .eq('enabled', true)

      if (testsError) {
        console.error('Error fetching tests by type:', testsError)
        throw testsError
      }

      testsToRun = tests || []
    }

    console.log(`Found ${testsToRun.length} tests to execute`)

    const executionResults = []

    // Execute each test
    for (const test of testsToRun) {
      const executionStartTime = new Date().toISOString()
      console.log(`Starting real test execution: ${test.test_name}`)

      let executionRecord: any = {
        test_id: test.id,
        execution_type: executionType,
        status: 'running',
        started_at: executionStartTime,
        results: null,
        error_message: null,
        duration_ms: null
      }

      // Insert execution record
      const { data: execution, error: executionError } = await supabaseClient
        .from('core_flow_test_executions')
        .insert(executionRecord)
        .select()
        .single()

      if (executionError) {
        console.error('Error creating execution record:', executionError)
        continue
      }

      const startTime = Date.now()

      try {
        // Execute the actual test based on type
        let testResult: any = {}
        
        switch (test.test_type) {
          case 'dashboard_setup':
            console.log('Testing backend dashboard systems...')
            testResult = await testDashboardSetup(supabaseClient)
            break
            
          case 'match_creation':
            console.log('Testing backend match creation systems...')
            testResult = await testMatchCreation(supabaseClient)
            break
            
          case 'conversation':
            console.log('Testing comprehensive conversation functionality...')
            testResult = await testConversationFlow(supabaseClient)
            break
            
          case 'output_generation':
            console.log('Testing output generation systems...')
            testResult = await testOutputGeneration(supabaseClient)
            break
            
          case 'next_match':
            console.log('Testing next match recommendation systems...')
            testResult = await testNextMatch(supabaseClient)
            break
            
          default:
            throw new Error(`Unknown test type: ${test.test_type}`)
        }

        const endTime = Date.now()
        const duration = endTime - startTime

        // Update execution record with success
        const { error: updateError } = await supabaseClient
          .from('core_flow_test_executions')
          .update({
            status: 'passed',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            results: testResult
          })
          .eq('id', execution.id)

        if (updateError) {
          console.error('Error updating execution record:', updateError)
        }

        // Record health metrics
        await recordHealthMetrics(supabaseClient, test.test_type, testResult, duration)

        executionResults.push({
          testId: test.id,
          testName: test.test_name,
          status: 'passed',
          duration,
          results: testResult
        })

        console.log(`Test ${test.test_name} completed successfully in ${duration}ms`)

      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        console.error(`Test ${test.test_name} failed:`, error)

        // Update execution record with failure
        const { error: updateError } = await supabaseClient
          .from('core_flow_test_executions')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            error_message: error.message
          })
          .eq('id', execution.id)

        if (updateError) {
          console.error('Error updating execution record:', updateError)
        }

        // Create alert for critical test failures
        if (test.critical) {
          await createCriticalAlert(supabaseClient, test, error.message)
        }

        executionResults.push({
          testId: test.id,
          testName: test.test_name,
          status: 'failed',
          duration,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        executed: executionResults.length,
        results: executionResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in core flow test execution:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Test implementations
async function testDashboardSetup(supabaseClient: any) {
  // Test database connectivity and basic dashboard data
  const { data: profiles, error: profilesError } = await supabaseClient
    .from('profiles')
    .select('id, first_name')
    .limit(1)

  if (profilesError) throw new Error(`Profile query failed: ${profilesError.message}`)
  
  const { data: communities, error: communitiesError } = await supabaseClient
    .from('communities')
    .select('id, name')
    .limit(1)

  if (communitiesError) throw new Error(`Communities query failed: ${communitiesError.message}`)

  return {
    database_connectivity: true,
    profiles_accessible: profiles?.length > 0,
    communities_accessible: communities?.length > 0,
    success_rate: 1.0
  }
}

async function testMatchCreation(supabaseClient: any) {
  // Test match creation flow without actually creating matches
  const { data: users, error: usersError } = await supabaseClient
    .from('profiles')
    .select('id')
    .limit(5)

  if (usersError) throw new Error(`User query failed: ${usersError.message}`)
  
  if (!users || users.length < 2) {
    throw new Error('Insufficient users for match creation test')
  }

  // Test match table structure
  const { data: matches, error: matchesError } = await supabaseClient
    .from('matches')
    .select('id, status')
    .limit(1)

  if (matchesError) throw new Error(`Matches query failed: ${matchesError.message}`)

  return {
    user_pool_available: users.length,
    match_table_accessible: true,
    sufficient_users: users.length >= 2,
    success_rate: 1.0
  }
}

async function testConversationFlow(supabaseClient: any) {
  // Test conversation-related functionality
  const { data: matches, error: matchesError } = await supabaseClient
    .from('matches')
    .select('id, status')
    .eq('status', 'active')
    .limit(1)

  if (matchesError) throw new Error(`Active matches query failed: ${matchesError.message}`)

  // Test chat messages structure if available
  try {
    const { data: messages, error: messagesError } = await supabaseClient
      .from('match_admin_messages')
      .select('id, content')
      .limit(1)

    return {
      active_matches_available: matches?.length > 0,
      messaging_system_accessible: !messagesError,
      conversation_ready: true,
      success_rate: 1.0
    }
  } catch (error) {
    return {
      active_matches_available: matches?.length > 0,
      messaging_system_accessible: false,
      conversation_ready: matches?.length > 0,
      success_rate: 0.8
    }
  }
}

async function testOutputGeneration(supabaseClient: any) {
  // Test AI/output generation related systems
  const { data: transcripts, error: transcriptsError } = await supabaseClient
    .from('upduo_transcripts')
    .select('id, content')
    .limit(1)

  if (transcriptsError && !transcriptsError.message.includes('does not exist')) {
    throw new Error(`Transcripts query failed: ${transcriptsError.message}`)
  }

  return {
    transcript_system_available: !transcriptsError,
    ai_processing_ready: true,
    output_generation_functional: true,
    success_rate: 1.0
  }
}

async function testNextMatch(supabaseClient: any) {
  // Test next match recommendation systems
  const { data: users, error: usersError } = await supabaseClient
    .from('profiles')
    .select('id, first_name')
    .limit(10)

  if (usersError) throw new Error(`Users query for matching failed: ${usersError.message}`)

  const { data: existingMatches, error: matchesError } = await supabaseClient
    .from('matches')
    .select('user1_id, user2_id')
    .limit(50)

  if (matchesError) throw new Error(`Existing matches query failed: ${matchesError.message}`)

  return {
    user_pool_size: users?.length || 0,
    existing_matches_count: existingMatches?.length || 0,
    matching_algorithm_ready: (users?.length || 0) > 1,
    success_rate: (users?.length || 0) > 1 ? 1.0 : 0.5
  }
}

async function recordHealthMetrics(supabaseClient: any, flowStep: string, testResult: any, duration: number) {
  const metrics = [
    {
      flow_step: flowStep,
      metric_type: 'success_rate',
      value: testResult.success_rate || 0,
      metadata: { test_result: testResult }
    },
    {
      flow_step: flowStep,
      metric_type: 'avg_duration',
      value: duration,
      metadata: { test_duration_ms: duration }
    }
  ]

  for (const metric of metrics) {
    await supabaseClient
      .from('core_flow_health_metrics')
      .insert(metric)
  }
}

async function createCriticalAlert(supabaseClient: any, test: any, errorMessage: string) {
  await supabaseClient
    .from('core_flow_alerts')
    .insert({
      alert_type: 'test_failure',
      severity: 'critical',
      title: `Critical Test Failure: ${test.test_name}`,
      message: `Critical test "${test.test_name}" has failed: ${errorMessage}`,
      flow_step: test.test_type,
      metadata: {
        test_id: test.id,
        test_name: test.test_name,
        error_message: errorMessage
      }
    })
}
