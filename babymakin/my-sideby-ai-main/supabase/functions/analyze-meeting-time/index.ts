import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { messageId } = await req.json();
    if (!messageId) {
      throw new Error("Message ID is required");
    }
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Fetch the message content
    const { data: message, error: messageError } = await supabase.from('match_scheduling_messages').select('*').eq('id', messageId).single();
    if (messageError) {
      throw new Error(`Failed to fetch message: ${messageError.message}`);
    }
    if (!message || !message.content) {
      throw new Error("Message not found or has no content");
    }
    // Get match details to determine who the participants are
    const { data: matchData, error: matchError } = await supabase.from('matches').select('user1_id, user2_id').eq('id', message.match_id).single();
    if (matchError) {
      throw new Error(`Failed to fetch match: ${matchError.message}`);
    }
    // Call OpenAI API to detect meeting times
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OpenAI API key not found");
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "system",
            content: `You are an AI that can detect meeting times in messages. Extract any date, day, and time mentions.
            For any detected meeting times, return a JSON object with the following structure:
            {
              "detectedTime": true/false, // boolean indicating if a time was detected
              "date": "ISO string" or null, // ISO format date if a specific date was mentioned
              "day": "day of week" or null, // day of the week if mentioned (Monday, Tuesday, etc.)
              "time": "HH:MM" or null, // time in 24-hour format
              "period": "AM/PM" or null, // AM or PM if specified
              "confidence": 0-1, // confidence in detection (0 to 1)
              "rawText": "extracted text" // the raw text containing the time information
            }`
          },
          {
            role: "user",
            content: message.content
          }
        ],
        temperature: 0.2
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    const aiResult = await response.json();
    const aiOutput = aiResult.choices[0].message.content;
    console.log("AI Output:", aiOutput);
    let timeData;
    try {
      // Parse the AI's JSON response
      timeData = JSON.parse(aiOutput);
    } catch (e) {
      console.error("Failed to parse AI output as JSON:", e);
      throw new Error("Failed to parse time detection result");
    }
    // If no time was detected, return early
    if (!timeData.detectedTime) {
      return new Response(JSON.stringify({
        success: true,
        detected: false
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Store the extracted time information
    let detectedTimeISO = null;
    // Convert the detected time to a proper ISO date string
    if (timeData.date) {
      // If we have a full date, use it
      detectedTimeISO = timeData.date;
    } else if (timeData.day) {
      // If we only have a day of the week, calculate the next occurrence
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
      const today = new Date();
      const todayDayIndex = today.getDay(); // 0 is Sunday
      const targetDayIndex = daysOfWeek.findIndex((d)=>d.toLowerCase() === timeData.day.toLowerCase());
      if (targetDayIndex >= 0) {
        // Calculate days to add
        let daysToAdd = targetDayIndex - todayDayIndex;
        if (daysToAdd <= 0) daysToAdd += 7; // If the day has already passed this week, go to next week
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysToAdd);
        // Set the time if available
        if (timeData.time) {
          const [hours, minutes] = timeData.time.split(':').map(Number);
          targetDate.setHours(timeData.period && timeData.period.toLowerCase() === "pm" && hours < 12 ? hours + 12 : hours, minutes || 0, 0, 0);
        } else {
          // Default to noon if no time provided
          targetDate.setHours(12, 0, 0, 0);
        }
        detectedTimeISO = targetDate.toISOString();
      }
    }
    if (!detectedTimeISO) {
      return new Response(JSON.stringify({
        success: true,
        detected: false
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Insert the meeting time into the database
    const meetingTimeData = {
      match_id: message.match_id,
      detected_time: detectedTimeISO,
      raw_text: timeData.rawText,
      status: "pending",
      created_by: message.sender_id,
      timezone: message.timezone || "UTC",
      confidence: timeData.confidence || 0.8
    };
    const { data: createdTime, error: timeError } = await supabase.from('match_meeting_times').insert(meetingTimeData).select().single();
    if (timeError) {
      throw new Error(`Failed to store meeting time: ${timeError.message}`);
    }
    return new Response(JSON.stringify({
      success: true,
      detected: true,
      meetingTime: createdTime
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Error processing meeting time:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message || "Unknown error occurred"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
