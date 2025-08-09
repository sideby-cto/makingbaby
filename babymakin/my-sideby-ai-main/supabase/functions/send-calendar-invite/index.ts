import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';
import { Resend } from "npm:resend@2.0.0";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Map common timezone abbreviations to IANA timezone names
const timezoneAbbreviations = {
  'PST': 'America/Los_Angeles',
  'PDT': 'America/Los_Angeles',
  'EST': 'America/New_York',
  'EDT': 'America/New_York',
  'CST': 'America/Chicago',
  'CDT': 'America/Chicago',
  'MST': 'America/Denver',
  'MDT': 'America/Denver',
  'PT': 'America/Los_Angeles',
  'ET': 'America/New_York',
  'CT': 'America/Chicago',
  'MT': 'America/Denver',
  'pacific': 'America/Los_Angeles',
  'eastern': 'America/New_York',
  'central': 'America/Chicago',
  'mountain': 'America/Denver'
};
/**
 * Fetches match data from the database
 */ async function getMatchData(matchId) {
  const { data, error } = await supabase.from('matches').select(`
      *,
      user1:user1_id(email, first_name),
      user2:user2_id(email, first_name)
    `).eq('id', matchId).single();
  if (error) {
    console.error("Error fetching match data:", error);
    throw error;
  }
  return data;
}
/**
 * Fetches the latest meeting time for a match
 */ async function getMeetingTime(matchId) {
  const { data, error } = await supabase.from('match_meeting_times').select('*').eq('match_id', matchId).order('created_at', {
    ascending: false
  }).limit(1);
  if (error) {
    console.error("Error fetching meeting time:", error);
    throw new Error(`No meeting time found for match ${matchId}. Please set a meeting time first.`);
  }
  if (!data || data.length === 0) {
    throw new Error(`No meeting time found for match ${matchId}. Please set a meeting time first.`);
  }
  return data[0];
}
/**
 * Gets the proper IANA timezone from abbreviation or defaults to Pacific Time
 */ function getTimezone(timezoneAbbr) {
  if (!timezoneAbbr) return 'America/Los_Angeles';
  return timezoneAbbreviations[timezoneAbbr.toLowerCase()] || 'UTC';
}
/**
 * Creates the calendar event
 */ async function createCalendarEvent(match, meetingTime, timezone) {
  // Import ical-generator more safely
  let ical;
  try {
    ical = require("ical-generator");
  } catch (e) {
    console.error("Error importing ical-generator:", e);
    // Try alternative import syntax
    const icalModule = await import("npm:ical-generator");
    ical = icalModule.default;
  }
  const calendar = ical({
    name: 'sideby Meeting',
    timezone: timezone
  });
  // Support both schemas - older records may have 'time', newer ones have 'detected_time'
  const startTime = new Date(meetingTime.detected_time);
  // End time is 25 minutes after start time (changed from 60 minutes)
  const endTime = new Date(startTime.getTime() + 25 * 60 * 1000);
  calendar.createEvent({
    start: startTime,
    end: endTime,
    summary: `sideby: ${match.user1.first_name} & ${match.user2.first_name}`,
    description: `${match.rationale || 'sideby Learning Connection Meeting'}\n\nMeeting Location: Upduo (use community code: washington)\nLink: https://app.upduo.com`,
    location: 'Upduo (virtual meeting)',
    url: 'https://app.upduo.com',
    timezone: timezone,
    attendees: [
      {
        email: match.user1.email,
        name: match.user1.first_name,
        rsvp: true,
        partstat: 'ACCEPTED',
        role: 'REQ-PARTICIPANT'
      },
      {
        email: match.user2.email,
        name: match.user2.first_name,
        rsvp: true,
        partstat: 'ACCEPTED',
        role: 'REQ-PARTICIPANT'
      }
    ]
  });
  return calendar;
}
/**
 * Formats meeting time for email content
 */ function formatMeetingTime(startTime) {
  const startTimeOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  return startTime.toLocaleString('en-US', startTimeOptions);
}
/**
 * Send email with calendar invite to a user
 */ async function sendInviteEmail(recipientEmail, recipientName, partnerName, formattedTime, calendarInvite) {
  try {
    const email = await resend.emails.send({
      from: "robot@sideby.ai",
      to: [
        recipientEmail
      ],
      subject: `Meeting with ${partnerName}`,
      html: `
        <p>Hi ${recipientName},</p>
        <p>Your meeting with ${partnerName} has been scheduled for <strong>${formattedTime}</strong>.</p>
        <p>You'll be meeting in <strong>Upduo</strong> - remember to use community code <strong>washington</strong> when signing up.</p>
        <p>Please find the calendar invite attached.</p>
        <p>Best,<br>robot@sideby.ai</p>
      `,
      attachments: [
        {
          filename: 'meeting.ics',
          content: calendarInvite
        }
      ]
    });
    return {
      success: true,
      email
    };
  } catch (error) {
    console.error(`Error sending email to ${recipientName}:`, error);
    return {
      success: false,
      error
    };
  }
}
/**
 * Add an admin message confirming the invite was sent
 */ async function addAdminConfirmationMessage(matchId, formattedTime) {
  try {
    const { error } = await supabase.from('match_scheduling_messages').insert({
      match_id: matchId,
      sender_id: '00000000-0000-0000-0000-000000000000',
      content: `📅 Calendar invite sent for ${formattedTime}. Please check your email!`,
      sender_type: 'admin'
    });
    if (error) {
      console.error("Error sending admin notification message:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Exception sending admin message:", error);
    return false;
  }
}
/**
 * Update meeting time status to confirmed
 */ async function updateMeetingTimeStatus(meetingTimeId) {
  const { error } = await supabase.from('match_meeting_times').update({
    status: 'confirmed'
  }).eq('id', meetingTimeId);
  if (error) {
    console.error("Error updating meeting time status:", error);
    return false;
  }
  return true;
}
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Parse request body and extract matchId
    const requestText = await req.text();
    let requestData;
    try {
      requestData = JSON.parse(requestText);
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError, "Request text:", requestText);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid JSON in request body"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { matchId, meetingTime: providedMeetingTime, suggestedOnly } = requestData;
    if (!matchId) {
      return new Response(JSON.stringify({
        success: false,
        error: "matchId is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`Processing calendar invite for match ID: ${matchId}`, providedMeetingTime ? `with provided meeting time: ${providedMeetingTime}` : "without provided meeting time");
    // Get match data
    const match = await getMatchData(matchId);
    console.log("Match data retrieved:", {
      id: match.id,
      user1: match.user1 ? {
        id: match.user1_id,
        email: match.user1.email,
        name: match.user1.first_name
      } : null,
      user2: match.user2 ? {
        id: match.user2_id,
        email: match.user2.email,
        name: match.user2.first_name
      } : null
    });
    let meetingTime;
    // If a meeting time was provided, create or update a meeting_time record
    if (providedMeetingTime) {
      const meetingTimeData = {
        match_id: matchId,
        detected_time: providedMeetingTime,
        status: suggestedOnly ? 'pending' : 'confirmed',
        timezone: 'UTC' // Default timezone if not available
      };
      const { data, error } = await supabase.from('match_meeting_times').insert(meetingTimeData).select().single();
      if (error) {
        console.error("Error creating meeting time:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to create meeting time record"
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      meetingTime = data;
    } else {
      // Get the latest meeting time
      try {
        meetingTime = await getMeetingTime(matchId);
        console.log("Meeting time data:", meetingTime);
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message || "No meeting time found"
        }), {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    // Get IANA timezone from the abbreviation or use default
    const timezone = getTimezone(meetingTime.timezone);
    console.log(`Using timezone: ${timezone}`);
    // Create calendar event
    const calendar = await createCalendarEvent(match, meetingTime, timezone);
    const calendarInvite = calendar.toString();
    console.log("Calendar invite generated successfully");
    // Format the meeting time for email content
    const startTime = new Date(meetingTime.time || meetingTime.detected_time);
    const formattedTime = formatMeetingTime(startTime);
    // Track email send status
    let user1EmailStatus = false;
    let user2EmailStatus = false;
    let emailErrors = [];
    // Send to user1
    const user1Result = await sendInviteEmail(match.user1.email, match.user1.first_name, match.user2.first_name, formattedTime, calendarInvite);
    if (user1Result.success) {
      console.log("Email sent to user1:", user1Result.email);
      user1EmailStatus = true;
    } else {
      emailErrors.push(`User1 (${match.user1.email}): ${user1Result.error.message}`);
    }
    // Send to user2
    const user2Result = await sendInviteEmail(match.user2.email, match.user2.first_name, match.user1.first_name, formattedTime, calendarInvite);
    if (user2Result.success) {
      console.log("Email sent to user2:", user2Result.email);
      user2EmailStatus = true;
    } else {
      emailErrors.push(`User2 (${match.user2.email}): ${user2Result.error.message}`);
    }
    // Update meeting time status to confirmed if at least one email was sent
    if (user1EmailStatus || user2EmailStatus) {
      await updateMeetingTimeStatus(meetingTime.id);
      await addAdminConfirmationMessage(matchId, formattedTime);
    }
    // Report status based on email send results
    if (emailErrors.length > 0) {
      if (!user1EmailStatus && !user2EmailStatus) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to send calendar invites",
          details: emailErrors
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } else {
        return new Response(JSON.stringify({
          success: true,
          partial: true,
          error: "Some invites failed to send",
          details: emailErrors,
          meetingTime: startTime.toISOString()
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    console.log("Calendar invites sent successfully");
    return new Response(JSON.stringify({
      success: true,
      meetingTime: startTime.toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    // Always return a JSON response, even for errors
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
