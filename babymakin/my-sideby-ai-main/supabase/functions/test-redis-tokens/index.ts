
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { getUpduoToken, getTokenCacheStats, invalidateUpduoToken } from "../_shared/upduo_auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set the auth header for the client
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    });

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin_user');
    
    if (adminError) {
      console.error('Admin check error:', adminError);
      throw new Error('Authorization failed');
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'test';

    let result;
    
    switch (action) {
      case 'test':
        // Test getting a token (should use cache if available)
        console.log('Testing Redis token cache...');
        const startTime = Date.now();
        const token = await getUpduoToken();
        const endTime = Date.now();
        
        const stats = await getTokenCacheStats();
        
        result = {
          success: true,
          message: 'Token retrieved successfully',
          responseTime: `${endTime - startTime}ms`,
          tokenPrefix: token.substring(0, 10) + '...',
          cacheStats: stats
        };
        break;
      
      case 'invalidate':
        // Invalidate the token to test cache miss scenario
        console.log('Invalidating Redis token cache...');
        const invalidated = await invalidateUpduoToken();
        
        result = {
          success: invalidated,
          message: invalidated ? 'Token cache invalidated' : 'Failed to invalidate token cache'
        };
        break;
      
      case 'benchmark':
        // Run a benchmark test
        console.log('Running Redis token cache benchmark...');
        const times: number[] = [];
        
        for (let i = 0; i < 5; i++) {
          const start = Date.now();
          await getUpduoToken();
          const end = Date.now();
          times.push(end - start);
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const finalStats = await getTokenCacheStats();
        
        result = {
          success: true,
          message: 'Benchmark completed',
          responseTimes: times,
          averageTime: `${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)}ms`,
          cacheStats: finalStats
        };
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Redis token test error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
