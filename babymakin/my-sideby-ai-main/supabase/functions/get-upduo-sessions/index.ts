import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { getUpduoToken } from "../_shared/upduo_auth.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// Helper function to create consistent responses
const createResponse = (body, status = 200)=>{
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
};
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // Create an AbortController with a 60-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort("Timeout exceeded"), 60000);
    const { email } = await req.json();
    console.log("Processing request for email:", email);
    if (!email) {
      return createResponse({
        success: false,
        error: "Email is required"
      });
    }
    const token = await getUpduoToken();
    console.log("Successfully got auth token");
    // Query with explicit organization context
    const sessionsQuery = `
      query GetSessions {
        organization(id: "org_rdpDlfhGHCB4ZQEY") {
          id
          name
          sessions(first: 5) {
            edges {
              node {
                id
                type
                createdAt
                transcriptContents {
                  text
                  type
                  speaker
                }
              }
            }
          }
        }
      }
    `;
    console.log("Testing basic session fetch with org context...");
    try {
      const sessionsResponse = await fetch("https://api.upduo.com/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Organization": "org_rdpDlfhGHCB4ZQEY"
        },
        body: JSON.stringify({
          query: sessionsQuery,
          variables: {
            organizationId: "org_rdpDlfhGHCB4ZQEY"
          }
        }),
        signal: controller.signal
      });
      // Clear the timeout as request completed
      clearTimeout(timeoutId);
      const rawResponse = await sessionsResponse.text();
      console.log("Raw API response:", rawResponse);
      if (!sessionsResponse.ok) {
        console.error("Sessions fetch error:", rawResponse);
        return createResponse({
          success: false,
          error: "Failed to fetch sessions from Upduo",
          details: rawResponse
        });
      }
      const data = JSON.parse(rawResponse);
      console.log("Parsed sessions response:", JSON.stringify(data, null, 2));
      // Return raw response for debugging
      return createResponse({
        success: true,
        data: data
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error:", fetchError);
      return createResponse({
        success: false,
        error: fetchError instanceof Error ? fetchError.message : "Network error occurred",
        details: String(fetchError)
      });
    }
  } catch (error) {
    console.error("Function error:", error);
    return createResponse({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      errorDetails: error
    });
  }
});
