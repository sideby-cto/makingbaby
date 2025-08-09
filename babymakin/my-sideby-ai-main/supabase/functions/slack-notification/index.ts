
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsPreflightRequest, createResponse } from "./cors.ts";
import { formatMessage } from "./formatters.ts";
import { sendToSlack } from "./slackSender.ts";

// Configure timeout for the entire function
const FUNCTION_TIMEOUT = 25000; // 25 seconds (less than Supabase's 30s limit)
const REQUEST_TIMEOUT = 10000; // 10 seconds for external requests

serve(async (req) => {
  console.log('🚀 Slack notification function triggered');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return handleCorsPreflightRequest();
  }

  // Set up function timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function timeout')), FUNCTION_TIMEOUT);
  });

  try {
    const result = await Promise.race([
      processNotification(req),
      timeoutPromise
    ]);
    return result;
  } catch (error) {
    console.error('❌ Function timeout or critical error:', error);
    return createResponse({
      success: false,
      error: 'Request processing timeout or system error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

async function processNotification(req) {
  try {
    // Get the webhook URL from the environment variable
    const webhookUrl = Deno.env.get('SLACK_FIRSTAUTH_WEBHOOK_URL');
    console.log('🔍 Environment check:');
    console.log('- SLACK_FIRSTAUTH_WEBHOOK_URL exists:', !!webhookUrl);
    console.log('- Webhook URL length:', webhookUrl ? webhookUrl.length : 0);

    if (!webhookUrl) {
      console.error('❌ No Slack webhook URL configured in environment');
      // Return success to prevent form blocking, but log the issue
      return createResponse({
        success: true,
        warning: 'Notification service temporarily unavailable - webhook not configured',
        timestamp: new Date().toISOString()
      }, 200);
    }

    // Validate webhook URL format
    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      console.error('❌ Invalid Slack webhook URL format');
      return createResponse({
        success: true,
        warning: 'Notification service configuration issue',
        timestamp: new Date().toISOString()
      }, 200);
    }

    // Enhanced request processing with better debugging
    let rawPayload;
    try {
      console.log('📥 Reading request body...');
      console.log('Request content-type:', req.headers.get('content-type'));
      console.log('Request content-length:', req.headers.get('content-length'));
      
      const readPromise = req.text();
      const readTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request read timeout')), 5000);
      });
      
      rawPayload = await Promise.race([readPromise, readTimeoutPromise]);
      console.log('✅ Raw request payload received (length):', rawPayload.length);
      
      // Enhanced logging for debugging
      if (rawPayload.length === 0) {
        console.error('🚨 CRITICAL: Received empty payload!');
        console.log('Request details:', {
          method: req.method,
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
          bodyLength: rawPayload.length
        });
      } else {
        console.log('📄 Raw payload preview:', rawPayload.substring(0, 500) + (rawPayload.length > 500 ? '...' : ''));
      }
    } catch (readError) {
      console.error('❌ Error reading request body:', readError);
      return createResponse({
        success: false,
        error: `Error reading request body: ${readError.message}`,
        timestamp: new Date().toISOString()
      }, 400);
    }

    // Validate payload is not empty - ENHANCED VALIDATION
    if (!rawPayload || rawPayload.trim().length === 0) {
      console.error('❌ Empty request payload detected');
      console.log('🔍 Debug info:', {
        payloadIsNull: rawPayload === null,
        payloadIsUndefined: rawPayload === undefined,
        payloadLength: rawPayload ? rawPayload.length : 'N/A',
        payloadTrimLength: rawPayload ? rawPayload.trim().length : 'N/A',
        requestMethod: req.method,
        requestUrl: req.url
      });
      
      return createResponse({
        success: false,
        error: 'Empty request payload',
        debug: {
          received_length: rawPayload ? rawPayload.length : 0,
          method: req.method,
          content_type: req.headers.get('content-type')
        },
        timestamp: new Date().toISOString()
      }, 400);
    }

    // Parse the payload with enhanced error handling
    let payload;
    try {
      console.log('🔄 Parsing JSON payload...');
      payload = JSON.parse(rawPayload);
      console.log('✅ JSON parsed successfully');
      console.log('📋 Payload structure:', {
        type: payload.type,
        user_id: payload.user?.id,
        user_email: payload.user?.email,
        help_type: payload.help_type,
        has_details: !!payload.details,
        has_feature_description: !!payload.feature_description,
        has_use_case: !!payload.use_case,
        payload_keys: Object.keys(payload)
      });
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      console.error('Raw payload that failed to parse:', rawPayload);
      return createResponse({
        success: false,
        error: `Invalid JSON payload: ${parseError.message}`,
        debug: {
          raw_payload_preview: rawPayload.substring(0, 200),
          parse_error: parseError.message
        },
        timestamp: new Date().toISOString()
      }, 400);
    }

    // Enhanced validation with detailed error reporting
    const validationErrors = [];
    if (!payload.type) {
      validationErrors.push('Missing required field: type');
    }
    if (!payload.user || !payload.user.email) {
      validationErrors.push('Missing required user information (user.email)');
    }

    // Validation rules based on notification type
    if (payload.type === 'feature_request') {
      if (!payload.feature_description || payload.feature_description.trim().length < 10) {
        validationErrors.push('Feature description must be at least 10 characters');
      }
      if (!payload.use_case || payload.use_case.trim().length < 10) {
        validationErrors.push('Use case must be at least 10 characters');
      }
    } else if (payload.type === 'new_signup') {
      // For new signup, we just need user email and optionally name
      // No additional validation needed beyond user.email which is checked above
      console.log('✅ New signup notification - basic validation passed');
    } else if (payload.type !== 'sponsorship_request') {
      // For other types (support_request, etc.), require details
      if (!payload.details || payload.details.trim().length < 10) {
        validationErrors.push('Details must be at least 10 characters');
      }
    }

    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors);
      return createResponse({
        success: false,
        error: 'Validation failed',
        validation_errors: validationErrors,
        timestamp: new Date().toISOString()
      }, 400);
    }

    // Format message for Slack based on payload type
    console.log('🔄 Formatting message for Slack...');
    try {
      const message = formatMessage(payload);
      console.log('✅ Message formatted successfully');
      console.log('📨 Message preview:', JSON.stringify(message, null, 2).substring(0, 500));
      
      // Send to Slack with timeout and retry
      console.log('📤 Sending to Slack...');
      const result = await sendToSlackWithRetry(webhookUrl, message);
      
      if (!result.success) {
        console.error('❌ Failed to send to Slack:', result.error);
        // Return success to prevent form blocking, but log the issue
        return createResponse({
          success: true,
          warning: 'Notification delivery delayed - Slack error',
          error_details: result.error,
          timestamp: new Date().toISOString()
        }, 200);
      }

      console.log('🎉 Successfully sent notification to Slack');
      return createResponse({
        success: true,
        message: 'Notification sent successfully',
        timestamp: new Date().toISOString()
      }, 200);
      
    } catch (formatError) {
      console.error('❌ Error formatting message:', formatError);
      // Return success to prevent form blocking
      return createResponse({
        success: true,
        warning: 'Notification processing issue - format error',
        error_details: formatError.message,
        timestamp: new Date().toISOString()
      }, 200);
    }

  } catch (error) {
    console.error('❌ Unexpected error processing notification:', error);
    console.error('Error stack:', error.stack);
    // Always return success to prevent form blocking
    return createResponse({
      success: true,
      warning: 'Notification service temporarily unavailable - system error',
      error_details: error.message,
      timestamp: new Date().toISOString()
    }, 200);
  }
}

async function sendToSlackWithRetry(webhookUrl, message, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📤 Slack attempt ${attempt}/${maxRetries}`);
    try {
      const sendPromise = sendToSlack(webhookUrl, message);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Slack request timeout')), REQUEST_TIMEOUT);
      });
      
      const result = await Promise.race([sendPromise, timeoutPromise]);
      
      if (result.success) {
        console.log(`✅ Slack attempt ${attempt} succeeded`);
        return result;
      }
      
      console.warn(`⚠️ Slack attempt ${attempt} failed:`, result.error);
      if (attempt === maxRetries) {
        return result;
      }
      
      // Wait before retry with exponential backoff
      const waitTime = 1000 * attempt;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      
    } catch (error) {
      console.error(`❌ Slack attempt ${attempt} failed with exception:`, error);
      if (attempt === maxRetries) {
        return {
          success: false,
          error: `All ${maxRetries} attempts failed: ${error.message}`
        };
      }
      
      // Wait before retry with exponential backoff
      const waitTime = 1000 * attempt;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  
  return {
    success: false,
    error: 'Max retries exceeded'
  };
}
