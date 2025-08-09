
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { configurationId } = await req.json()
    console.log('Starting load test for configuration:', configurationId)

    // Get configuration
    const { data: config, error: configError } = await supabase
      .from('load_test_configurations')
      .select('*')
      .eq('id', configurationId)
      .single()

    if (configError || !config) {
      throw new Error(`Configuration not found: ${configError?.message}`)
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('load_test_executions')
      .insert({
        configuration_id: configurationId,
        status: 'running',
        started_at: new Date().toISOString(),
        created_by: config.created_by
      })
      .select()
      .single()

    if (executionError || !execution) {
      throw new Error(`Failed to create execution: ${executionError?.message}`)
    }

    console.log('Created execution:', execution.id)

    // Run the load test
    const results = await runLoadTest(config, execution.id, supabase)

    // Calculate aggregated metrics
    const aggregatedMetrics = await calculateAggregatedMetrics(execution.id, supabase)

    // Update execution with final results
    const { error: updateError } = await supabase
      .from('load_test_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: Math.round((Date.now() - new Date(execution.started_at).getTime()) / 1000),
        total_requests: aggregatedMetrics.totalRequests,
        successful_requests: aggregatedMetrics.successfulRequests,
        failed_requests: aggregatedMetrics.failedRequests,
        average_response_time: aggregatedMetrics.avgResponseTime,
        min_response_time: aggregatedMetrics.minResponseTime,
        max_response_time: aggregatedMetrics.maxResponseTime,
        requests_per_second: aggregatedMetrics.avgRequestsPerSecond,
        error_rate: aggregatedMetrics.errorRate,
        results_data: results,
        performance_metrics: aggregatedMetrics
      })
      .eq('id', execution.id)

    if (updateError) {
      console.error('Failed to update execution:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        executionId: execution.id,
        results: aggregatedMetrics
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Load test error:', error)
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

async function runLoadTest(config: any, executionId: string, supabase: any) {
  const { virtual_users, duration_seconds, ramp_up_seconds, target_url } = config
  const testStartTime = Date.now()
  const testEndTime = testStartTime + (duration_seconds * 1000)
  
  console.log(`Starting load test: ${virtual_users} users, ${duration_seconds}s duration`)

  const workers: Promise<any>[] = []
  const rampUpDelay = ramp_up_seconds * 1000 / virtual_users

  // Start virtual users with ramp-up
  for (let i = 0; i < virtual_users; i++) {
    const startDelay = i * rampUpDelay
    workers.push(
      runVirtualUser(i, target_url, testEndTime, startDelay, executionId, supabase)
    )
  }

  // Wait for all workers to complete
  const results = await Promise.allSettled(workers)
  
  console.log(`Load test completed. ${results.length} workers finished.`)
  
  return {
    completed_workers: results.filter(r => r.status === 'fulfilled').length,
    failed_workers: results.filter(r => r.status === 'rejected').length,
    test_duration: Math.round((Date.now() - testStartTime) / 1000)
  }
}

async function runVirtualUser(
  userId: number, 
  targetUrl: string, 
  testEndTime: number, 
  startDelay: number,
  executionId: string,
  supabase: any
) {
  // Wait for ramp-up delay
  if (startDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, startDelay))
  }

  let requestCount = 0
  const startTime = Date.now()

  while (Date.now() < testEndTime) {
    const requestStart = Date.now()
    let success = false
    let responseTime = 0

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      responseTime = Date.now() - requestStart
      success = response.ok
      requestCount++
    } catch (error) {
      responseTime = Date.now() - requestStart
      success = false
      requestCount++
    }

    // Record metrics every few requests to avoid overwhelming the database
    if (requestCount % 5 === 0) {
      await supabase
        .from('load_test_metrics')
        .insert({
          execution_id: executionId,
          active_users: 1,
          requests_per_second: requestCount / ((Date.now() - startTime) / 1000),
          response_time: responseTime,
          error_count: success ? 0 : 1
        })
        .catch((error: any) => console.error('Failed to insert metric:', error))
    }

    // Small delay to prevent overwhelming the target
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return {
    userId,
    requestCount,
    duration: Date.now() - startTime
  }
}

async function calculateAggredatedMetrics(executionId: string, supabase: any) {
  // Get all metrics for this execution
  const { data: metrics, error } = await supabase
    .from('load_test_metrics')
    .select('*')
    .eq('execution_id', executionId)

  if (error || !metrics || metrics.length === 0) {
    console.error('Failed to get metrics:', error)
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      avgRequestsPerSecond: 0,
      errorRate: 0
    }
  }

  const responseTimes = metrics.map(m => m.response_time).filter(rt => rt > 0)
  const requestsPerSecond = metrics.map(m => m.requests_per_second).filter(rps => rps > 0)
  const totalErrors = metrics.reduce((sum, m) => sum + (m.error_count || 0), 0)
  const totalRequests = metrics.reduce((sum, m) => sum + Math.max(1, m.requests_per_second || 1), 0)

  return {
    totalRequests: Math.round(totalRequests),
    successfulRequests: Math.round(totalRequests - totalErrors),
    failedRequests: totalErrors,
    avgResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
    minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
    maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
    avgRequestsPerSecond: requestsPerSecond.length > 0 ? Math.round((requestsPerSecond.reduce((a, b) => a + b, 0) / requestsPerSecond.length) * 100) / 100 : 0,
    errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0
  }
}

// Fix typo in function name
async function calculateAggregatedMetrics(executionId: string, supabase: any) {
  return calculateAggredatedMetrics(executionId, supabase)
}
