import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processNotificationDigests } from "./services/notificationProcessor.ts";
import { TEMPLATE_VERSION } from "./shared/emailTemplates.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// Main handler
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    console.log(`Process notification digests function invoked (Template v${TEMPLATE_VERSION})`);
    const result = await processNotificationDigests();
    console.log("Digest processing completed", result);
    return new Response(JSON.stringify({
      success: true,
      template_version: TEMPLATE_VERSION,
      ...result
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
