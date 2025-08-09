import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-signature, x-timestamp',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Helper function to verify API key
function verifyApiKey(apiKey: string | null): boolean {
  const validApiKey = Deno.env.get('UPDUO_API_KEY');
  return apiKey === validApiKey;
}

// Helper function to verify signature
function verifySignature(body: string, signature: string | null, timestamp: string | null): boolean {
  if (!signature || !timestamp) return false;
  
  const secret = Deno.env.get('UPDUO_WEBHOOK_SECRET');
  if (!secret) return false;
  
  // Check timestamp is not too old (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 300) return false;
  
  // Verify HMAC signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const message = encoder.encode(`${timestamp}.${body}`);
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key =>
    crypto.subtle.sign('HMAC', key, message)
  ).then(signature_buffer => {
    const expected = Array.from(new Uint8Array(signature_buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return signature.replace('sha256=', '') === expected;
  }).catch(() => false);
}

// Rate limiting check
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 100) { // 100 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
}

// Create response helper
function createResponse(data: any, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...headers }
  });
}

// Process session data
async function processSessionData(supabase: any, sessionData: any) {
  try {
    console.log('Processing session data:', sessionData);
    
    // Extract session information
    const session = sessionData.session || sessionData;
    const users = session.users || [];
    const transcriptContents = session.transcriptContents || [];
    
    // Process each user in the session
    for (const user of users) {
      if (!user.firstName || !user.lastName) continue;
      
      // Check if user exists in our database by name
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('first_name', user.firstName)
        .eq('last_name', user.lastName)
        .single();
      
      if (existingUser) {
        // Store transcript data
        const { error: transcriptError } = await supabase
          .from('upduo_transcripts')
          .insert({
            user_id: existingUser.id,
            transcript: transcriptContents,
            metadata: {
              session_id: session.id,
              session_type: session.type,
              duration: session.duration,
              participants: users.map(u => ({
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role
              })),
              knowledgeNodes: session.knowledgeNodes || [],
              metrics: session.metrics || {}
            }
          });
        
        if (transcriptError) {
          console.error('Error storing transcript:', transcriptError);
        } else {
          console.log(`Stored transcript for user ${existingUser.id}`);
        }
      }
    }
    
    return { success: true, processed_users: users.length };
  } catch (error) {
    console.error('Error processing session data:', error);
    throw error;
  }
}

// Process user data
async function processUserData(supabase: any, userData: any) {
  try {
    console.log('Processing user data:', userData);
    
    // Store or update user information
    const { error } = await supabase
      .from('upduo_user_mappings')
      .upsert({
        upduo_user_id: userData.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        mapping_method: 'api_sync',
        confidence_score: 1.0,
        is_verified: true,
        metadata: {
          sync_source: 'upduo_api',
          last_sync: new Date().toISOString(),
          user_data: userData
        }
      }, {
        onConflict: 'upduo_user_id'
      });
    
    if (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
    
    return { success: true, user_id: userData.id };
  } catch (error) {
    console.error('Error processing user data:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const path = url.pathname;
  
  console.log(`Upduo API request: ${req.method} ${path}`);
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Security checks
    const apiKey = req.headers.get('x-api-key');
    const signature = req.headers.get('x-signature');
    const timestamp = req.headers.get('x-timestamp');
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Verify API key
    if (!verifyApiKey(apiKey)) {
      console.warn(`Invalid API key from ${clientIp}`);
      return createResponse({ error: 'Invalid API key' }, 401);
    }
    
    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for ${clientIp}`);
      return createResponse({ error: 'Rate limit exceeded' }, 429);
    }
    
    // Get request body for signature verification
    const body = req.method !== 'GET' ? await req.text() : '';
    
    // Verify signature for non-GET requests
    if (req.method !== 'GET') {
      const signatureValid = await verifySignature(body, signature, timestamp);
      if (!signatureValid) {
        console.warn(`Invalid signature from ${clientIp}`);
        return createResponse({ error: 'Invalid signature' }, 401);
      }
    }
    
    // Parse body if present
    let requestData = null;
    if (body) {
      try {
        requestData = JSON.parse(body);
      } catch (error) {
        return createResponse({ error: 'Invalid JSON payload' }, 400);
      }
    }
    
    // Route handling
    switch (path) {
      case '/sessions':
        if (req.method === 'POST') {
          if (!requestData) {
            return createResponse({ error: 'Session data required' }, 400);
          }
          
          const result = await processSessionData(supabase, requestData);
          console.log('Session processed successfully:', result);
          
          return createResponse({
            message: 'Session data processed successfully',
            ...result
          });
        }
        break;
        
      case '/users':
        if (req.method === 'POST') {
          if (!requestData) {
            return createResponse({ error: 'User data required' }, 400);
          }
          
          const result = await processUserData(supabase, requestData);
          console.log('User processed successfully:', result);
          
          return createResponse({
            message: 'User data processed successfully',
            ...result
          });
        }
        break;
        
      case '/health':
        if (req.method === 'GET') {
          return createResponse({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          });
        }
        break;
        
      default:
        return createResponse({ error: 'Endpoint not found' }, 404);
    }
    
    return createResponse({ error: 'Method not allowed' }, 405);
    
  } catch (error) {
    console.error('Upduo API error:', error);
    return createResponse({
      error: 'Internal server error',
      message: error.message
    }, 500);
  }
});