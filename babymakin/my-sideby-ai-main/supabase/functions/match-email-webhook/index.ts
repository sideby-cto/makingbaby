import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Load the HTML template
const loadEmailTemplate = async () => {
  try {
    const response = await fetch("https://my.sideby.ai/notification-new-connection.html");
    return await response.text();
  } catch (error) {
    console.error("Failed to load email template:", error);
    // Fallback inline template
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Learning Connection: Meet {{MATCHED_USER_NAME}}</title>
    <style type="text/css">
        @font-face {
            font-family: 'VC Nudge';
            src: url('https://my.sideby.ai/style/fonts/web/VCNudgeNormal-Bold.woff2') format('woff2');
            font-weight: bold;
            font-display: swap;
        }
        @font-face {
            font-family: 'Clash Grotesk';
            src: url('https://my.sideby.ai/style/fonts/web/clashgrotesk/ClashGrotesk-Regular.woff2') format('woff2');
            font-weight: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'PP Neue Machina';
            src: url('https://my.sideby.ai/style/fonts/web/PP Neue Machina/PPNeueMachina-PlainRegular.woff2') format('woff2');
            font-weight: normal;
            font-display: swap;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FBF6E3; font-family: 'Clash Grotesk', Arial, sans-serif;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #FBF6E3;">
        <div style="background: linear-gradient(135deg, #F67201 0%, #FF8A3D 100%); padding: 32px 0; text-align: center; position: relative;">
            <div style="position: relative; z-index: 2;">
                <img src="https://my.sideby.ai/lovable-uploads/4fa666a9-c191-4ff7-9213-c43d4c9fc9aa.png" alt="sideby" style="width: 180px; height: auto; display: inline-block;">
            </div>
        </div>
        <div style="padding: 64px 40px; text-align: center; background-color: #FBF6E3;">
            <h1 style="font-family: 'VC Nudge', Arial, sans-serif; font-size: 88px; line-height: 100%; letter-spacing: 2%; color: #401612; margin: 0 0 16px 0; font-weight: bold;">
                New Learning Connection: Meet {{MATCHED_USER_NAME}}
            </h1>
            <p style="font-family: 'Clash Grotesk', Arial, sans-serif; font-size: 24px; line-height: 150%; letter-spacing: 0%; color: #401612; margin: 0 0 40px 0; opacity: 0.8;">
                {{RATIONALE}}
            </p>
            <p style="font-family: 'Clash Grotesk', Arial, sans-serif; font-size: 20px; line-height: 150%; letter-spacing: 0%; color: #401612; margin: 0 0 48px 0; max-width: 480px; margin-left: auto; margin-right: auto;">
                Log in to your sideby dashboard to connect with your match and schedule your first session.
            </p>
            <div style="text-align: center; margin: 48px 0;">
                <a href="{{DASHBOARD_URL}}" style="font-family: 'PP Neue Machina', Arial, sans-serif; font-size: 30px; line-height: 110%; letter-spacing: -2%; background-color: #F67201; color: #401612; text-decoration: none; padding: 16px 32px; border-radius: 6px; display: inline-block; font-weight: normal; min-width: 200px;">
                    Go to Dashboard
                </a>
            </div>
        </div>
        <div style="padding: 40px 40px 60px 40px; text-align: center; background-color: #FBF6E3; border-top: 1px solid rgba(64, 22, 18, 0.1);">
            <p style="font-family: 'Clash Grotesk', Arial, sans-serif; font-size: 16px; line-height: 150%; color: #401612; margin: 0 0 16px 0; opacity: 0.7;">
                You received this email because you're a member of the sideby learning community.
            </p>
            <p style="margin: 0;">
                <a href="{{MANAGE_NOTIFICATIONS_URL}}" style="font-family: 'Clash Grotesk', Arial, sans-serif; font-size: 16px; color: #F67201; text-decoration: underline; text-decoration-color: #F67201; text-underline-offset: 4px;">
                    Manage notifications
                </a>
            </p>
            <p style="font-family: 'Clash Grotesk', Arial, sans-serif; font-size: 14px; color: #401612; margin: 24px 0 0 0; opacity: 0.5;">
                &copy; {{CURRENT_YEAR}} sideby
            </p>
        </div>
    </div>
</body>
</html>`;
  }
};

// Generate HTML email template for match notifications using the external template
const generateMatchEmailTemplate = async (recipientName, matchedUserName, rationale) => {
  const currentYear = new Date().getFullYear();
  const dashboardUrl = "https://my.sideby.ai";
  const manageNotificationsUrl = "https://my.sideby.ai/configuration";
  
  const template = await loadEmailTemplate();
  
  return template
    .replace(/{{MATCHED_USER_NAME}}/g, matchedUserName || "your new connection")
    .replace(/{{RATIONALE}}/g, rationale || "You've been matched based on your learning preferences.")
    .replace(/{{DASHBOARD_URL}}/g, dashboardUrl)
    .replace(/{{MANAGE_NOTIFICATIONS_URL}}/g, manageNotificationsUrl)
    .replace(/{{CURRENT_YEAR}}/g, currentYear.toString())
    .replace(/Meet Michael/g, `Meet ${matchedUserName}`);
};
serve(async (req)=>{
  const payload = await req.json();
  const match = payload.record;
  try {
    console.log("Starting to process match email for match:", match.id);
    // Fetch user details
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({
        error: "Server configuration error"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    // Fetch user profiles
    const usersResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=in.(${match.user1_id},${match.user2_id})`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });
    const users = await usersResponse.json();
    const user1 = users.find((u)=>u.id === match.user1_id);
    const user2 = users.find((u)=>u.id === match.user2_id);
    // Check if both users exist and aren't deleted
    if (!user1 || !user2 || user1.status === "deleted" || user2.status === "deleted") {
      console.log("One or both users not found or deleted:", {
        user1Found: !!user1,
        user2Found: !!user2,
        user1Status: user1?.status,
        user2Status: user2?.status
      });
      return new Response(JSON.stringify({
        error: "One or both users not found or deleted"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Found users for match email:", {
      user1: user1?.email,
      user2: user2?.email,
      user1NotificationPrefs: user1?.notification_preferences,
      user2NotificationPrefs: user2?.notification_preferences
    });
    // Check notification preferences for both users
    const user1EmailEnabled = user1.notification_preferences?.email !== false;
    const user2EmailEnabled = user2.notification_preferences?.email !== false;
    // Send email to user1 if email notifications are enabled
    const emailPromises = [];
    if (user1 && user1.email && user1EmailEnabled) {
      console.log("Sending email to user1:", user1.email);
      emailPromises.push(resend.emails.send({
        from: "robot@sideby.ai",
        to: [
          user1.email
        ],
        subject: `New Learning Connection: Meet ${user2.first_name}`,
        html: await generateMatchEmailTemplate(user1.first_name || "there", user2.first_name || "your new connection", match.rationale || "You've been matched based on your learning preferences.")
      }).catch((err)=>{
        console.error("Error sending email to user1:", err);
        return {
          error: err.message,
          recipient: user1.email
        };
      }));
    } else {
      console.log("Skipping email to user1:", {
        hasEmail: !!user1?.email,
        emailEnabled: user1EmailEnabled
      });
    }
    // Send email to user2 if email notifications are enabled
    if (user2 && user2.email && user2EmailEnabled) {
      console.log("Sending email to user2:", user2.email);
      emailPromises.push(resend.emails.send({
        from: "robot@sideby.ai",
        to: [
          user2.email
        ],
        subject: `New Learning Connection: Meet ${user1.first_name}`,
        html: await generateMatchEmailTemplate(user2.first_name || "there", user1.first_name || "your new connection", match.rationale || "You've been matched based on your learning preferences.")
      }).catch((err)=>{
        console.error("Error sending email to user2:", err);
        return {
          error: err.message,
          recipient: user2.email
        };
      }));
    } else {
      console.log("Skipping email to user2:", {
        hasEmail: !!user2?.email,
        emailEnabled: user2EmailEnabled
      });
    }
    // Send all emails and wait for results
    const emailResults = await Promise.all(emailPromises);
    console.log("Email sending results:", emailResults);
    // Check if any emails were actually sent
    if (emailPromises.length === 0) {
      console.log("No emails sent - both users have email notifications disabled or no valid emails");
      // Still update the match with email_sent_at timestamp
      // This prevents repeated attempts to send emails
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/matches?id=eq.${match.id}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          email_sent_at: new Date().toISOString()
        })
      });
      if (!updateResponse.ok) {
        console.error("Failed to update match status:", await updateResponse.text());
      }
      return new Response(JSON.stringify({
        success: true,
        emailsSent: 0,
        reason: "Email notifications disabled"
      }), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
    // Update match with email sent timestamp only after successful send
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/matches?id=eq.${match.id}`, {
      method: "PATCH",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        email_sent_at: new Date().toISOString()
      })
    });
    if (!updateResponse.ok) {
      throw new Error("Failed to update match status: " + await updateResponse.text());
    }
    return new Response(JSON.stringify({
      success: true,
      emailsSent: emailResults.length
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Error sending match email:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
