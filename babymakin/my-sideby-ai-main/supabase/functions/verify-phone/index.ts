import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import twilio from 'npm:twilio';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Enhanced phone number validation
 */
function validatePhoneNumber(phoneNumber: string): { isValid: boolean; formatted?: string; error?: string } {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check if it starts with + and has at least 10 digits
  if (cleaned.startsWith('+') && cleaned.length >= 11 && cleaned.length <= 17) {
    return { isValid: true, formatted: cleaned };
  }
  
  // If no country code, assume US/Canada (+1)
  if (!cleaned.startsWith('+') && cleaned.length === 10) {
    return { isValid: true, formatted: `+1${cleaned}` };
  }
  
  // If it starts with 1 and has 11 digits, assume US/Canada
  if (!cleaned.startsWith('+') && cleaned.length === 11 && cleaned.startsWith('1')) {
    return { isValid: true, formatted: `+${cleaned}` };
  }
  
  return { isValid: false, error: 'Invalid phone number format. Please include country code.' };
}

/**
 * Enhanced verification code validation
 */
function validateVerificationCode(code: string): { isValid: boolean; error?: string } {
  if (!code || typeof code !== 'string') {
    return { isValid: false, error: 'Verification code is required' };
  }
  
  const cleaned = code.replace(/\D/g, '');
  if (cleaned.length !== 6) {
    return { isValid: false, error: 'Verification code must be exactly 6 digits' };
  }
  
  return { isValid: true };
}

/**
 * Enhanced environment validation with detailed errors
 */
function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!accountSid) errors.push('TWILIO_ACCOUNT_SID not configured');
  if (!authToken) errors.push('TWILIO_AUTH_TOKEN not configured');
  if (!twilioNumber) errors.push('TWILIO_PHONE_NUMBER not configured');
  if (!supabaseUrl) errors.push('SUPABASE_URL not configured');
  if (!supabaseServiceKey) errors.push('SUPABASE_SERVICE_ROLE_KEY not configured');
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Creates and initializes a Twilio client with enhanced error handling
 */
function initTwilioClient() {
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    console.error("Environment validation failed:", envValidation.errors);
    throw new Error(`Configuration errors: ${envValidation.errors.join(', ')}`);
  }

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const twilioNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

  try {
    const client = twilio(accountSid, authToken);
    console.log(`Twilio client initialized successfully with number: ${twilioNumber}`);
    return { client, twilioNumber };
  } catch (error) {
    console.error("Failed to initialize Twilio client:", error);
    throw new Error(`Twilio initialization failed: ${error.message}`);
  }
}

/**
 * Creates a Supabase client with enhanced error handling
 */
async function initSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.1');
    const client = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client initialized successfully");
    return client;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    throw new Error(`Supabase initialization failed: ${error.message}`);
  }
}

/**
 * Generates a random 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Enhanced function to save verification code with retry logic
 */
async function saveVerificationCode(supabase: any, userId: string, code: string): Promise<void> {
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to save verification code (attempt ${attempt}/${maxRetries}) for user: ${userId}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          phone_verification_code: code,
          phone_verification_sent_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Database update failed: ${error.message}`);
      }
      
      console.log(`Verification code saved successfully for user: ${userId}`);
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to save verification code after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Enhanced SMS sending with comprehensive error handling
 */
async function sendSmsVerificationCode(twilioClient: any, twilioNumber: string, phoneNumber: string, code: string) {
  try {
    console.log(`Sending SMS verification code to ${phoneNumber} from ${twilioNumber}`);
    
    const message = await twilioClient.messages.create({
      body: `sideby verification code: ${code}. Valid for 10 minutes. If you didn't request this, please ignore.`,
      from: twilioNumber,
      to: phoneNumber,
      // Add optional parameters for better delivery
      statusCallback: undefined, // You can add a webhook URL here if needed
      validityPeriod: 600 // 10 minutes in seconds
    });

    console.log(`SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}, Status: ${message.status}`);
    return {
      success: true,
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from
    };
  } catch (twilioError: any) {
    console.error('Detailed Twilio error:', {
      code: twilioError.code,
      message: twilioError.message,
      moreInfo: twilioError.moreInfo,
      status: twilioError.status,
      details: twilioError.details
    });
    
    // Map specific Twilio errors to user-friendly messages
    let userMessage = 'Failed to send SMS verification code';
    
    switch (twilioError.code) {
      case 21211:
        userMessage = 'Invalid phone number format';
        break;
      case 21614:
        userMessage = 'Invalid phone number - unable to route to this number';
        break;
      case 21408:
        userMessage = 'Permission to send SMS to this number is denied';
        break;
      case 30007:
        userMessage = 'Message delivery failed - carrier rejected the message';
        break;
      case 30008:
        userMessage = 'Message delivery failed - unknown carrier error';
        break;
      default:
        if (twilioError.message) {
          userMessage = `SMS service error: ${twilioError.message}`;
        }
    }
    
    throw new Error(userMessage);
  }
}

/**
 * Enhanced send verification handler
 */
async function handleSendVerification(supabase: any, userId: string, phoneNumber: string) {
  try {
    console.log(`=== Starting verification send process ===`);
    console.log(`User ID: ${userId}, Phone: ${phoneNumber}`);
    
    // Validate phone number format
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.error || 'Invalid phone number');
    }
    
    const formattedPhone = phoneValidation.formatted!;
    console.log(`Phone number validated and formatted: ${formattedPhone}`);

    // Generate verification code
    const code = generateVerificationCode();
    console.log(`Generated verification code: ${code}`);

    // Save to database first
    await saveVerificationCode(supabase, userId, code);

    // Initialize Twilio and send SMS
    const { client: twilioClient, twilioNumber } = initTwilioClient();
    const smsResult = await sendSmsVerificationCode(twilioClient, twilioNumber, formattedPhone, code);

    console.log(`=== Verification send completed successfully ===`);
    return {
      success: true,
      message: 'Verification code sent successfully',
      ...smsResult
    };
  } catch (error) {
    console.error("=== Error in handleSendVerification ===", error);
    throw error;
  }
}

/**
 * Enhanced code verification with better error handling
 */
async function verifyCode(supabase: any, userId: string, providedCode: string) {
  try {
    console.log(`=== Starting code verification process ===`);
    console.log(`User ID: ${userId}, Code: ${providedCode}`);
    
    // Validate verification code format
    const codeValidation = validateVerificationCode(providedCode);
    if (!codeValidation.isValid) {
      return {
        success: false,
        error: codeValidation.error || 'Invalid verification code format'
      };
    }

    // Get the stored verification code with retry logic
    let profile;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('phone_verification_code, phone_verification_sent_at, phone_number, phone_verified')
          .eq('id', userId)
          .single();

        if (error) throw error;
        profile = data;
        break;
      } catch (error) {
        console.error(`Database read attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw new Error('Failed to retrieve verification data from database');
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    console.log("Profile verification data:", {
      hasStoredCode: !!profile.phone_verification_code,
      storedCodeLength: profile.phone_verification_code?.length,
      sentAt: profile.phone_verification_sent_at,
      phoneNumber: profile.phone_number,
      alreadyVerified: profile.phone_verified
    });

    // Check if already verified
    if (profile.phone_verified) {
      return {
        success: false,
        error: 'Phone number is already verified'
      };
    }

    // Check if verification code exists
    if (!profile.phone_verification_code) {
      return {
        success: false,
        error: 'No verification code found. Please request a new code.'
      };
    }

    // Check expiration (10 minutes)
    const sentAt = new Date(profile.phone_verification_sent_at || new Date());
    const now = new Date();
    const timeDiffMs = now.getTime() - sentAt.getTime();
    const isExpired = timeDiffMs > 10 * 60 * 1000; // 10 minutes

    console.log("Code expiration check:", {
      sentAt: sentAt.toISOString(),
      now: now.toISOString(),
      timeDiffMs,
      isExpired,
      minutesElapsed: Math.round(timeDiffMs / 60000)
    });

    if (isExpired) {
      return {
        success: false,
        error: 'Verification code has expired. Please request a new one.'
      };
    }

    // Verify the code
    const storedCode = profile.phone_verification_code.trim();
    const inputCode = providedCode.trim();
    
    console.log("Code comparison:", {
      storedCode,
      inputCode,
      matches: storedCode === inputCode
    });

    if (storedCode !== inputCode) {
      return {
        success: false,
        error: 'Invalid verification code. Please check and try again.'
      };
    }

    // Update profile to mark as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone_verified: true,
        phone_verification_code: null,
        phone_verification_sent_at: null
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Failed to update profile after verification:", updateError);
      throw new Error(`Failed to complete verification: ${updateError.message}`);
    }

    console.log(`=== Phone verification completed successfully for user: ${userId} ===`);
    return {
      success: true,
      message: 'Phone number verified successfully'
    };
  } catch (error) {
    console.error("=== Error in verifyCode ===", error);
    throw error;
  }
}

/**
 * Enhanced error response helper
 */
function createErrorResponse(error: any, defaultStatus = 500) {
  let status = defaultStatus;
  let message = 'An unexpected error occurred';
  
  if (error.message) {
    message = error.message;
    
    // Set appropriate status codes based on error type
    if (message.includes('Invalid phone number') || 
        message.includes('Verification code must be') ||
        message.includes('required fields')) {
      status = 400; // Bad Request
    } else if (message.includes('Configuration errors') || 
               message.includes('not configured')) {
      status = 503; // Service Unavailable
    } else if (message.includes('Permission denied') || 
               message.includes('unauthorized')) {
      status = 403; // Forbidden
    } else if (message.includes('not found')) {
      status = 404; // Not Found
    } else if (message.includes('expired') || 
               message.includes('already verified')) {
      status = 409; // Conflict
    }
  }
  
  console.error(`Returning error response: ${status} - ${message}`);
  
  return new Response(JSON.stringify({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Main handler function with enhanced logging and error handling
 */
serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`=== [${requestId}] Request started at ${new Date().toISOString()} ===`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment on startup
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error(`[${requestId}] Environment validation failed:`, envValidation.errors);
      return createErrorResponse(
        new Error(`Service configuration error: ${envValidation.errors.join(', ')}`),
        503
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return createErrorResponse(new Error('Invalid JSON in request body'), 400);
    }

    const { phoneNumber, action, userId, verificationCode } = requestBody;
    
    console.log(`[${requestId}] Request details:`, {
      action,
      userId,
      phoneNumber: phoneNumber ? `${phoneNumber.substring(0, 3)}***${phoneNumber.slice(-2)}` : 'null',
      hasVerificationCode: !!verificationCode,
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin')
    });

    // Validate required fields based on action
    const missingFields = [];
    if (!action) missingFields.push('action');
    if (!userId) missingFields.push('userId');
    
    // Only require phoneNumber for 'send' action
    if (action === 'send' && !phoneNumber) {
      missingFields.push('phoneNumber');
    }
    
    // Only require verificationCode for 'verify' action
    if (action === 'verify' && !verificationCode) {
      missingFields.push('verificationCode');
    }

    if (missingFields.length > 0) {
      return createErrorResponse(
        new Error(`Missing required fields: ${missingFields.join(', ')}`),
        400
      );
    }

    // Validate action
    if (!['send', 'verify'].includes(action)) {
      return createErrorResponse(
        new Error(`Invalid action: ${action}. Valid actions are 'send' or 'verify'`),
        400
      );
    }

    // Initialize Supabase client
    const supabase = await initSupabaseClient();

    // Process the request
    let result;
    const startTime = Date.now();
    
    if (action === 'send') {
      result = await handleSendVerification(supabase, userId, phoneNumber);
    } else if (action === 'verify') {
      result = await verifyCode(supabase, userId, verificationCode);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Action '${action}' completed in ${processingTime}ms:`, {
      success: result.success,
      message: result.message
    });

    return new Response(JSON.stringify({
      ...result,
      requestId,
      processingTime
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    const processingTime = Date.now() - parseInt(requestId.split('-')[0], 16);
    console.error(`[${requestId}] Unhandled error after ${processingTime}ms:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return createErrorResponse(error);
  } finally {
    console.log(`=== [${requestId}] Request completed ===`);
  }
});