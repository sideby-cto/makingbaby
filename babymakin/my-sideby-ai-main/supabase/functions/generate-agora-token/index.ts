// Follow this setup guide to integrate the Deno runtime version of the Agora Token Builder
// https://www.npmjs.com/package/agora-token
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RtcRole, RtcTokenBuilder } from "npm:agora-access-token";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    // Ensure request is POST
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }
    const { channelName, uid } = await req.json();
    if (!channelName || !uid) {
      throw new Error('Missing required parameters');
    }
    // Get the Agora App ID and Certificate from environment variables
    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');
    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }
    console.log('Generating token for channel:', channelName, 'uid:', uid);
    // Token expires in 3 hours
    const expirationTimeInSeconds = 3600 * 3;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, RtcRole.PUBLISHER, privilegeExpiredTs);
    console.log('Token generated successfully');
    return new Response(JSON.stringify({
      token,
      appId,
      channelName,
      uid
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in generate-agora-token:', error.message);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Error generating Agora token'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
