
import { getUpduoToken, clearUpduoTokenCache } from "../_shared/upduo_auth.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const UPDUO_API_URL = "https://api.upduo.com/api/graphql";
const ORG_ID = "org_rdpDlfhGHCB4ZQEY";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

async function addUserToUpduo(userData) {
  console.log("=== Environment Debug Info ===");
  console.log("Deno version:", Deno.version);
  console.log("Environment variables present:", {
    UPDUO_CLIENT_SECRET: !!Deno.env.get("UPDUO_CLIENT_SECRET"),
    SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  });
  console.log("API URL:", UPDUO_API_URL);
  console.log("Organization ID:", ORG_ID);
  console.log("=== Starting Upduo Integration ===");
  
  console.log("Getting Upduo token for API request...");
  let token;
  try {
    token = await getUpduoToken(true); // Force refresh to ensure valid token
    console.log("Successfully obtained Upduo token (length:", token.length, "chars)");
  } catch (error) {
    console.error("Failed to get Upduo token:", error);
    console.error("Error type:", error.constructor.name);
    console.error("Error stack:", error.stack);
    throw new Error(`Authentication failed: ${error.message}`);
  }

  // Default tags for all Sideby users
  const defaultTags = ["AI for Education Leadership", "AI in Education"];

  console.log("Preparing GraphQL request to add user to organization roster...");
  console.log("Organization ID:", ORG_ID);
  console.log("User data being sent:", {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    region: "US",
    tags: defaultTags
  });

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
        tags: defaultTags
      }
    }
  };

  console.log("Making GraphQL API call to:", `${UPDUO_API_URL}?org_id=${ORG_ID}`);
  console.log("Request body:", JSON.stringify(requestBody, null, 2));
  console.log("Using token starting with:", token.substring(0, 20) + "...");

  const startTime = Date.now();
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
    
    // Handle 401 authentication errors with token refresh
    if (response.status === 401) {
      console.log("Received 401 unauthorized. Clearing token cache and retrying...");
      await clearUpduoTokenCache();
      
      try {
        const freshToken = await getUpduoToken(true);
        console.log("Retrying request with fresh token...");
        
        const retryResponse = await fetch(`${UPDUO_API_URL}?org_id=${ORG_ID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log("Retry response status:", retryResponse.status, retryResponse.statusText);
        
        if (!retryResponse.ok) {
          let retryErrorText;
          try {
            retryErrorText = await retryResponse.text();
          } catch (retryReadError) {
            retryErrorText = `Failed to read retry error response: ${retryReadError.message}`;
          }
          console.error("Retry request also failed:", retryErrorText);
          throw new Error(`Authentication retry failed: ${retryResponse.status} ${retryResponse.statusText} - ${retryErrorText}`);
        }
        
        const retryResult = await retryResponse.json();
        console.log("Successfully added user to Upduo roster on retry:", retryResult);
        return retryResult;
      } catch (retryError) {
        console.error("Token refresh and retry failed:", retryError);
        throw new Error(`Failed to add user to Upduo roster after authentication retry: ${retryError.message}`);
      }
    }
    
    throw new Error(`Failed to add user to Upduo roster: ${response.status} ${response.statusText} - ${errorText}`);
  }

  let result;
  try {
    result = await response.json();
  } catch (parseError) {
    console.error("Failed to parse successful response as JSON:", parseError);
    throw new Error(`Response parsing failed: ${parseError.message}`);
  }

  console.log("Successfully added user to Upduo roster:", result);
  return result;
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`[${requestId}] === New Upduo Integration Request ===`);
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
    const requestBody = await req.json();
    const { firstName, lastName, email } = requestBody;
    
    console.log(`[${requestId}] Processing Upduo integration request for ${firstName} ${lastName} (${email})`);
    console.log(`[${requestId}] Request body keys:`, Object.keys(requestBody));
    console.log(`[${requestId}] Environment: ${Deno.env.get("ENVIRONMENT") || "development"}`);
    console.log(`[${requestId}] Function updated with correct authentication endpoint and client credentials`);
    
    const result = await addUserToUpduo({
      firstName,
      lastName,
      email
    });

    console.log(`[${requestId}] Successfully added ${email} to Upduo roster`);
    console.log(`[${requestId}] Result:`, JSON.stringify(result, null, 2));
    
    return new Response(JSON.stringify({
      success: true,
      result,
      requestId
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(`[${requestId}] Error in upduo-integration function:`, error);
    console.error(`[${requestId}] Error type:`, error.constructor.name);
    console.error(`[${requestId}] Error stack:`, error.stack);
    
    // Provide more specific error information
    let errorCode = "UNKNOWN_ERROR";
    if (error.message.includes("Authentication failed")) {
      errorCode = "AUTH_ERROR";
    } else if (error.message.includes("Failed to add user to Upduo roster")) {
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
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
