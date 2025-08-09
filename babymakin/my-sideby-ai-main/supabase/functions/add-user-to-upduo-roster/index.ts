import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getUpduoToken } from '../_shared/upduo_auth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const UPDUO_API_URL = 'https://api.upduo.com/api/graphql?org_id=org_rdpDlfhGHCB4ZQEY'
const ORG_ID = 'org_rdpDlfhGHCB4ZQEY'

interface UserData {
  userId: string
  firstName: string
  lastName: string
  email: string
  crewCode?: string
}

async function addUserToUpduo(userData: UserData, retryCount = 0): Promise<any> {
  const maxRetries = 3
  
  try {
    console.log(`Adding user to Upduo (attempt ${retryCount + 1}):`, { 
      email: userData.email, 
      firstName: userData.firstName,
      crewCode: userData.crewCode 
    })

    // Enhanced token logging for debugging
    const token = await getUpduoToken()
    console.log('Token info:', {
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 10) + '...',
      environment: Deno.env.get('DENO_ENV') || 'development'
    })
    
    const mutation = `
      mutation addToOrganizationRoster($data: AddToOrganizationRosterInput!) {
        addToOrganizationRoster(data: $data)
      }
    `

    const variables = {
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        isAdmin: false,
        isLeader: false,
        isActive: true,
        tags: userData.crewCode ? [userData.crewCode] : ["sideby"]
      }
    }

    // Enhanced request logging
    const requestBody = JSON.stringify({
      query: mutation,
      variables: variables
    })
    
    console.log('Upduo API Request Details:', {
      url: UPDUO_API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.substring(0, 10)}...`
      },
      bodyLength: requestBody.length,
      variables: variables
    })

    const response = await fetch(UPDUO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: requestBody
    })

    // Enhanced response logging
    console.log('Upduo API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    })

    if (!response.ok) {
      // Capture response body for error debugging
      let errorBody = ''
      try {
        errorBody = await response.text()
        console.log('Error response body:', errorBody)
      } catch (bodyError) {
        console.log('Could not read error response body:', bodyError)
      }

      if (response.status === 401 && retryCount < maxRetries) {
        console.log('Token expired, retrying with fresh token...')
        const { clearUpduoTokenCache } = await import('../_shared/upduo_auth.ts')
        await clearUpduoTokenCache()
        return addUserToUpduo(userData, retryCount + 1)
      }
      
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
    }

    const result = await response.json()
    
    console.log('Raw Upduo API Response:', JSON.stringify(result, null, 2))
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    console.log('Successfully added user to Upduo:', result.data)
    return result.data

  } catch (error) {
    console.error(`Error adding user to Upduo (attempt ${retryCount + 1}):`, error)
    
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
      console.log(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return addUserToUpduo(userData, retryCount + 1)
    }
    
    throw error
  }
}

async function logUpduoAttempt(supabase: any, userData: UserData, success: boolean, error?: string) {
  try {
    await supabase.from('upduo_integration_logs').insert({
      user_id: userData.userId,
      email: userData.email,
      success,
      error_message: error,
      crew_code: userData.crewCode,
      attempt_timestamp: new Date().toISOString()
    })
  } catch (logError) {
    console.error('Failed to log Upduo attempt:', logError)
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Add health check endpoint
  if (req.method === 'GET') {
    const url = new URL(req.url)
    if (url.pathname.includes('/health')) {
      return await handleHealthCheck()
    }
    if (url.pathname.includes('/test')) {
      return await handleTestEndpoint(url.searchParams)
    }
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record, manual = false } = await req.json()
    
    // Enhanced environment logging
    console.log('Environment details:', {
      DENO_ENV: Deno.env.get('DENO_ENV'),
      SUPABASE_URL: Deno.env.get('SUPABASE_URL')?.substring(0, 30) + '...',
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasUpduoSecret: !!Deno.env.get('UPDUO_CLIENT_SECRET'),
      timestamp: new Date().toISOString()
    })
    
    console.log('Processing Upduo integration for:', { 
      userId: record?.id, 
      email: record?.email,
      manual,
      fullRecord: record
    })

    // Validate required data
    if (!record?.id || !record?.email || !record?.first_name) {
      await updateProfileStatus(supabase, record?.id, 'failed', 'Missing required user data')
      throw new Error('Missing required user data')
    }

    const userData: UserData = {
      userId: record.id,
      firstName: record.first_name || '',
      lastName: record.last_name || '',
      email: record.email,
      crewCode: record.crew_code
    }

    // Check if user is already successfully in Upduo (avoid duplicates)
    const { data: existingSuccessLog } = await supabase
      .from('upduo_integration_logs')
      .select('success, error_message')
      .eq('user_id', userData.userId)
      .eq('success', true)
      .maybeSingle()

    if (existingSuccessLog && !manual) {
      console.log('User already successfully added to Upduo, skipping')
      await updateProfileStatus(supabase, userData.userId, 'success', null)
      return new Response(
        JSON.stringify({ success: true, message: 'User already in Upduo' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Add user to Upduo
    try {
      const result = await addUserToUpduo(userData)
      
      // Log successful attempt with detailed response
      await logUpduoAttempt(supabase, userData, true, `Upduo API success: ${JSON.stringify(result)}`)
      
      // Update profile status to success
      await updateProfileStatus(supabase, userData.userId, 'success', null)
      
      console.log('User successfully added to Upduo roster:', result)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User added to Upduo roster',
          data: result 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch (upduoError) {
      // Log the specific Upduo API failure
      const errorMessage = `Upduo API failed: ${upduoError.message}`
      await logUpduoAttempt(supabase, userData, false, errorMessage)
      
      // Update profile status to failed
      await updateProfileStatus(supabase, userData.userId, 'failed', errorMessage)
      
      throw upduoError
    }

  } catch (error) {
    console.error('Failed to add user to Upduo:', error)
    
    // Additional error logging for edge function failures
    try {
      const { record } = await req.json()
      if (record?.id) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        const errorMessage = `Edge function error: ${error.message}`
        await logUpduoAttempt(supabase, {
          userId: record.id,
          firstName: record.first_name || '',
          lastName: record.last_name || '',
          email: record.email || '',
          crewCode: record.crew_code
        }, false, errorMessage)
        
        await updateProfileStatus(supabase, record.id, 'failed', errorMessage)
      }
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

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

// Helper function to update profile status
async function updateProfileStatus(supabase: any, userId: string, status: string, errorMessage: string | null) {
  try {
    const updateData: any = { upduo_status: status }
    if (errorMessage) {
      updateData.upduo_error = errorMessage
    } else {
      updateData.upduo_error = null
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
    
    if (error) {
      console.error('Failed to update profile status:', error)
    } else {
      console.log(`Updated profile ${userId} status to: ${status}`)
    }
  } catch (error) {
    console.error('Error updating profile status:', error)
  }
}

// Health check endpoint
async function handleHealthCheck() {
  try {
    console.log('Health check requested')
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: Deno.env.get('DENO_ENV') || 'development',
      secrets: {
        hasUpduoSecret: !!Deno.env.get('UPDUO_CLIENT_SECRET'),
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    }
    
    // Test Upduo token retrieval
    try {
      const token = await getUpduoToken()
      healthData.upduo = {
        tokenRetrieved: !!token,
        tokenLength: token?.length || 0
      }
    } catch (tokenError) {
      healthData.upduo = {
        tokenRetrieved: false,
        error: tokenError.message
      }
    }
    
    return new Response(
      JSON.stringify(healthData, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

// Test endpoint for different user data formats
async function handleTestEndpoint(searchParams: URLSearchParams) {
  try {
    const testEmail = searchParams.get('email') || 'test@example.com'
    const testFirstName = searchParams.get('firstName') || 'Test'
    const testLastName = searchParams.get('lastName') || 'User'
    const testCrewCode = searchParams.get('crewCode') || null
    
    console.log('Test endpoint called with:', { testEmail, testFirstName, testLastName, testCrewCode })
    
    const userData: UserData = {
      userId: 'test-user-id',
      firstName: testFirstName,
      lastName: testLastName,
      email: testEmail,
      crewCode: testCrewCode
    }
    
    // Test the mutation construction and variables
    const mutation = `
      mutation addToOrganizationRoster($data: AddToOrganizationRosterInput!) {
        addToOrganizationRoster(data: $data)
      }
    `

    const variables = {
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        isAdmin: false,
        isLeader: false,
        isActive: true,
        tags: userData.crewCode ? [userData.crewCode] : ["sideby"]
      }
    }
    
    const testResult = {
      mutation,
      variables,
      userData,
      requestWouldBe: {
        url: UPDUO_API_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [TOKEN]'
        },
        body: JSON.stringify({ query: mutation, variables })
      }
    }
    
    return new Response(
      JSON.stringify(testResult, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}