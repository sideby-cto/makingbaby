import { corsHeaders } from "./corsHeaders.ts";
export function handleCorsPreflightRequest(req) {
  // Handle CORS preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }
  return null;
}
export function createJsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    status: 200
  });
}
export function createErrorResponse(error) {
  const message = error instanceof Error ? error.message : String(error);
  return new Response(JSON.stringify({
    error: message
  }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    status: 400
  });
}
