const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
export function handleCorsPreflightRequest() {
  console.log('✅ Handling CORS preflight request');
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}
export function createResponse(data, status = 200) {
  // Ensure consistent response structure
  const responseData = {
    success: data.success || false,
    timestamp: data.timestamp || new Date().toISOString(),
    ...data
  };
  console.log(`📤 Creating response with status ${status}:`, JSON.stringify(responseData, null, 2));
  return new Response(JSON.stringify(responseData), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
