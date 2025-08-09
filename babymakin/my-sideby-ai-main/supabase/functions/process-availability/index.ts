import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { handleCorsPreflightRequest, createJsonResponse, createErrorResponse } from "./utils/corsUtils.ts";
import { generateMockTimeSlots } from "./utils/timeUtils.ts";
import { callOpenAI, parseTimeSlots } from "./utils/openaiUtils.ts";
import { buildPrompt, determineTimeScope } from "./utils/promptUtils.ts";
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);
/**
 * Validates the user input to ensure required fields are present
 */ function validateInput(availabilityText, imageUrl) {
  if (!availabilityText && !imageUrl) {
    throw new Error("Either availability text or calendar image must be provided");
  }
}
/**
 * Prepares messages for the OpenAI API call
 */ function prepareMessages(promptText, imageUrl, daysToInclude) {
  const messages = [
    {
      role: "system",
      content: `You are an assistant that helps schedule 18-minute learning sessions based on availability. 
               Today's date is ${new Date().toLocaleDateString()}. Only suggest dates within the next ${daysToInclude} days.`
    }
  ];
  if (imageUrl) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: promptText
        },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "auto"
          }
        }
      ]
    });
  } else {
    messages.push({
      role: "user",
      content: promptText
    });
  }
  return messages;
}
/**
 * Processes the user's availability information to generate time slots
 */ async function processAvailability(availabilityText, imageUrl, pacingLevel) {
  validateInput(availabilityText, imageUrl);
  // Determine the time scope based on pacing level
  const { timeScope, daysToInclude } = determineTimeScope(pacingLevel);
  // Build the prompt
  const promptText = buildPrompt(availabilityText || '', imageUrl, timeScope);
  // Create messages for OpenAI
  const messages = prepareMessages(promptText, imageUrl, daysToInclude);
  // Call OpenAI
  try {
    const openAIData = await callOpenAI(messages, openAIApiKey);
    const assistantMessage = openAIData.choices[0].message.content;
    return parseTimeSlots(assistantMessage);
  } catch (e) {
    console.error("Error processing with OpenAI:", e);
    // Fallback to generating mock time slots if OpenAI processing fails
    return generateMockTimeSlots(daysToInclude);
  }
}
serve(async (req)=>{
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  try {
    const { availabilityText, imageUrl, pacingLevel } = await req.json();
    const timeSlots = await processAvailability(availabilityText, imageUrl, pacingLevel);
    return createJsonResponse({
      timeSlots
    });
  } catch (error) {
    return createErrorResponse(error);
  }
});
