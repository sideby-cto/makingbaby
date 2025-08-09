import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import twilio from 'npm:twilio';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Check for Twilio credentials
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!accountSid || !authToken || !twilioNumber) {
      console.error("Missing Twilio credentials", {
        hasSid: !!accountSid,
        hasToken: !!authToken,
        hasNumber: !!twilioNumber
      });
      return new Response(JSON.stringify({
        success: false,
        error: "Twilio configuration is incomplete. Please check your environment variables."
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    const twilioClient = twilio(accountSid, authToken);
    // Parse request body
    const { phoneNumber, message, userId, isVerification } = await req.json();
    if (!phoneNumber || !message) {
      throw new Error('Phone number and message are required');
    }
    // Log the SMS sending attempt
    console.log(`Attempting to send SMS to ${phoneNumber}: ${message}`, {
      userId,
      isVerification
    });
    // Check if user ID is provided (for verification check)
    if (userId && !isVerification) {
      // Create a Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase credentials');
      }
      // Create Supabase client
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.1');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      // Check if the phone is verified
      const { data: profile, error: profileError } = await supabase.from('profiles').select('phone_verified').eq('id', userId).single();
      if (profileError) {
        console.error("Error checking phone verification:", profileError);
        throw new Error(`Error checking phone verification: ${profileError.message}`);
      }
      // Only send if phone is verified
      if (!profile.phone_verified) {
        return new Response(JSON.stringify({
          error: 'Phone number is not verified'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        });
      }
    }
    // Format phone number to ensure it has country code
    const formattedNumber = ensurePhoneNumberFormat(phoneNumber);
    try {
      console.log(`Sending SMS via Twilio from ${twilioNumber} to ${formattedNumber}`);
      // For regular notifications, prepend "sideby.ai - " to the message
      const messageContent = isVerification ? message : `sideby.ai - ${message}`;
      // Send SMS via Twilio
      const twilioResponse = await twilioClient.messages.create({
        body: messageContent,
        from: twilioNumber,
        to: formattedNumber
      });
      console.log(`SMS sent successfully: ${twilioResponse.sid}`);
      // Log this to the notifications_delivery_logs table
      if (userId) {
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
          if (supabaseUrl && supabaseServiceKey) {
            const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.1');
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            await supabase.from('notification_delivery_logs').insert({
              notification_id: null,
              channel: 'sms',
              success: true,
              user_id: userId
            });
          }
        } catch (logError) {
          console.error('Error logging SMS delivery:', logError);
        // Continue execution, don't fail the request
        }
      }
      return new Response(JSON.stringify({
        success: true,
        sid: twilioResponse.sid
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      return new Response(JSON.stringify({
        success: false,
        error: `SMS sending failed: ${twilioError.message || 'Unknown Twilio error'}`,
        code: twilioError.code,
        details: twilioError
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
  } catch (error) {
    console.error('Error sending SMS:', error.message);
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
/**
 * Helper function to ensure phone numbers are properly formatted for Twilio
 */ function ensurePhoneNumberFormat(phoneNumber) {
  // Remove any non-digit characters except the leading +
  const cleaned = phoneNumber.startsWith('+') ? '+' + phoneNumber.substring(1).replace(/\D/g, '') : phoneNumber.replace(/\D/g, '');
  // If no + prefix and looks like a US number without country code
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return `+${cleaned}`;
  }
  return cleaned;
}
