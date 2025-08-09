
import { supabase } from "@/integrations/supabase/client";
import { Match } from "../types/matches";
import { NotificationPreferences } from "@/types/profile";

/**
 * Send match notification email to both participants
 * This is used by the admin UI when manually sending emails
 */
export const sendMatchEmail = async (match: Match) => {
  try {
    // Verify we have the required data before sending
    if (!match.user1?.first_name || !match.user2?.first_name || 
        !match.user1?.email || !match.user2?.email) {
      throw new Error("Missing required user information for email");
    }

    // Check if both users have email notifications enabled
    const { data: user1Data } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', match.user1.id)
      .single();
    
    const { data: user2Data } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', match.user2.id)
      .single();
    
    // Cast notification preferences to the correct type
    const user1Prefs = user1Data?.notification_preferences as NotificationPreferences | null;
    const user2Prefs = user2Data?.notification_preferences as NotificationPreferences | null;
    
    // Get email preferences with fallback to true (default is enabled)
    const user1EmailEnabled = user1Prefs?.email !== false;
    const user2EmailEnabled = user2Prefs?.email !== false;

    // If both users have disabled email, we should notify the admin
    if (!user1EmailEnabled && !user2EmailEnabled) {
      console.log("No emails sent - both users have disabled email notifications");
      return { 
        success: false, 
        error: "Both users have disabled email notifications" 
      };
    }

    // Filter users based on their preferences
    const emailRecipients = {
      user1: user1EmailEnabled ? {
        firstName: match.user1.first_name,
        email: match.user1.email
      } : null,
      user2: user2EmailEnabled ? {
        firstName: match.user2.first_name,
        email: match.user2.email
      } : null
    };

    console.log("Sending match email with recipients:", emailRecipients);

    // Call the edge function to send emails
    const { error } = await supabase
      .functions.invoke("match-email-webhook", {
        body: { 
          record: {
            id: match.id,
            user1_id: match.user1.id,
            user2_id: match.user2.id,
            rationale: match.rationale
          }
        }
      });

    if (error) {
      console.error("Error invoking match-email-webhook:", error);
      throw error;
    }

    // Update the match in the database to mark email as sent if not already
    if (!match.email_sent_at) {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', match.id);
        
      if (updateError) {
        console.error("Error updating match email_sent_at:", updateError);
      }
    }
      
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : String(err)
    };
  }
};
