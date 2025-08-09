import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
// Setup Supabase client with service role for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const serviceRoleClient = createClient(supabaseUrl, supabaseServiceKey);
serve(async (req)=>{
  try {
    // Handle CORS for browser requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        status: 204
      });
    }
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Method not allowed"
      }), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 405
      });
    }
    // Parse request body
    const { userId, engagementType, communityId } = await req.json();
    if (!userId || !engagementType) {
      return new Response(JSON.stringify({
        error: "Missing required fields"
      }), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    // Insert the engagement log using the service role client
    const { data, error } = await serviceRoleClient.from("engagement_logs").insert({
      user_id: userId,
      engagement_type: engagementType,
      community_id: communityId || null
    });
    if (error) {
      console.error("Error inserting engagement log:", error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
