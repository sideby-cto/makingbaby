
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { getTokenCacheStats, getTokenCacheHealth } from "../_shared/upduo_auth.ts";

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
    const action = url.searchParams.get('action') || 'stats';

    let result;
    
    switch (action) {
      case 'stats':
        result = await getTokenCacheStats();
        break;
      
      case 'health':
        result = await getTokenCacheHealth();
        break;
      
      case 'monitor':
        // Get comprehensive monitoring data
        const [stats, health] = await Promise.all([
          getTokenCacheStats(),
          getTokenCacheHealth()
        ]);
        
        result = {
          timestamp: new Date().toISOString(),
          health,
          stats,
          summary: {
            totalTokens: Object.keys(stats).length,
            healthyTokens: Object.values(stats).filter(s => s.isValid).length,
            refreshingTokens: Object.values(stats).filter(s => s.isRefreshing).length,
            totalCacheHits: Object.values(stats).reduce((sum, s) => sum + (s.cacheHits || 0), 0),
            totalCacheMisses: Object.values(stats).reduce((sum, s) => sum + (s.cacheMisses || 0), 0),
            cacheHitRatio: (() => {
              const hits = Object.values(stats).reduce((sum, s) => sum + (s.cacheHits || 0), 0);
              const misses = Object.values(stats).reduce((sum, s) => sum + (s.cacheMisses || 0), 0);
              const total = hits + misses;
              return total > 0 ? (hits / total * 100).toFixed(2) + '%' : 'N/A';
            })()
          }
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
    console.error('Token cache monitor error:', error);
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
