
import { getUpduoToken, clearUpduoTokenCache } from "../_shared/upduo_auth.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UPDUO_API_URL = "https://api.upduo.com/api/graphql";
const ORG_ID = "org_rdpDlfhGHCB4ZQEY";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

async function tagUserInUpduo(userData) {
  try {
    console.log("=== Environment Debug Info ===");
    console.log("Deno version:", Deno.version);
    console.log("Environment variables present:", {
      UPDUO_CLIENT_SECRET: !!Deno.env.get("UPDUO_CLIENT_SECRET"),
      SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    });
    console.log("=== Starting Crew Tag Integration ===");
    console.log("Tagging user in Upduo with crew code:", userData.crewCode);
    
    // Force refresh token to ensure we have the corrected authentication
    const token = await getUpduoToken(true);
    console.log("Successfully obtained Upduo token (length:", token.length, "chars)");

    // Normalize crew code to lowercase for comparison
    const normalizedCrewCode = userData.crewCode.toLowerCase().trim();
    
    // Determine tag based on crew code - with fallback to default
    let tag = "";
    if (normalizedCrewCode === "gatesonpostsecondary" || normalizedCrewCode === "gates") {
      tag = "Gates"; // Gates tag for both crews
      console.log(`Using Gates tag for crew code: ${normalizedCrewCode}`);
    } else {
      // Fallback to default instead of rejecting
      console.log(`No specific tag mapping for crew code: ${normalizedCrewCode}, falling back to default tags`);
      tag = null; // Will use default tags only
    }

    // Build tags array - always include default tags
    const upduo_tags = [
      {
        name: "AI for Education Leadership",
        description: "For educators who work beyond a single school site to connect."
      },
      {
        name: "AI in Education",
        description: "For classroom-focused AI implementation"
      }
    ];

    // Add crew-specific tag if we have one
    if (tag) {
      upduo_tags.unshift({
        name: tag,
        description: `Member of ${tag} crew`
      });
    }

    console.log(`Adding user to Upduo with tags: ${upduo_tags.map((t) => t.name).join(", ")}`);
    console.log("Using token starting with:", token.substring(0, 20) + "...");

    const startTime = Date.now();
    const requestBody = {
      query: `
        mutation AddToOrganizationRoster($data: AddToOrganizationRosterInput!) {
          addToOrganizationRoster(data: $data)
        }
      `,
      variables: {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          isAdmin: false,
          isLeader: false,
          isActive: true,
          region: "US",
          tags: upduo_tags.map((tag) => tag.name)
        }
      }
    };

    console.log("Making GraphQL API call to:", `${UPDUO_API_URL}?org_id=${ORG_ID}`);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${UPDUO_API_URL}?org_id=${ORG_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseTime = Date.now() - startTime;

    console.log("GraphQL response status:", response.status, response.statusText);
    console.log("Response time:", responseTime + "ms");
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    console.log("Response content-type:", response.headers.get("content-type"));

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (readError) {
        errorText = `Failed to read error response: ${readError.message}`;
      }
      
      console.error("GraphQL request failed:");
      console.error("Status:", response.status, response.statusText);
      console.error("Error body:", errorText);
      console.error("Request took:", responseTime + "ms");
      
      // If we get 401, try clearing cache and getting a completely fresh token
      if (response.status === 401) {
        console.log("Got 401, clearing token cache and trying once more...");
        await clearUpduoTokenCache();
        // Don't retry here - let the calling function handle retries
      }
      
      throw new Error(`Failed to add/update user in Upduo: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Upduo API response:", responseData);

    return {
      success: true,
      tag: tag || "default",
      tags: upduo_tags.map((t) => t.name)
    };
  } catch (error) {
    console.error("Error in tagUserInUpduo:", error);
    return {
      success: false,
      message: error.message
    };
  }
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`[${requestId}] === New Upduo Crew Tag Request ===`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] User-Agent: ${req.headers.get("user-agent")}`);
  console.log(`[${requestId}] Origin: ${req.headers.get("origin")}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] CORS preflight request handled`);
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization")
          }
        }
      }
    );

    const requestBody = await req.json();
    const { firstName, lastName, email, crewCode } = requestBody;

    console.log(`[${requestId}] Received request to tag user in Upduo:`, {
      firstName,
      lastName,
      email,
      crewCode
    });
    console.log(`[${requestId}] Request body keys:`, Object.keys(requestBody));
    console.log(`[${requestId}] Environment: ${Deno.env.get("ENVIRONMENT") || "development"}`);
    console.log(`[${requestId}] Function updated with correct authentication endpoint and client credentials`);

    if (!firstName || !lastName || !email) {
      console.log(`[${requestId}] Missing required fields`);
      return new Response(JSON.stringify({
        error: "Missing required fields: firstName, lastName, and email are required",
        requestId
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }

    // Allow missing crewCode - will fall back to default tags
    const result = await tagUserInUpduo({
      firstName,
      lastName,
      email,
      crewCode: crewCode || "default"
    });

    console.log(`[${requestId}] Successfully processed crew tag request`);
    console.log(`[${requestId}] Result:`, JSON.stringify(result, null, 2));

    return new Response(JSON.stringify({
      ...result,
      requestId
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error(`[${requestId}] Error in upduo-crew-tag function:`, error);
    console.error(`[${requestId}] Error type:`, error.constructor.name);
    console.error(`[${requestId}] Error stack:`, error.stack);
    
    // Provide more specific error information
    let errorCode = "UNKNOWN_ERROR";
    if (error.message.includes("Authentication failed")) {
      errorCode = "AUTH_ERROR";
    } else if (error.message.includes("Failed to add/update user in Upduo")) {
      errorCode = "API_ERROR";
    } else if (error.message.includes("Response parsing failed")) {
      errorCode = "PARSE_ERROR";
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorCode,
      requestId,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
