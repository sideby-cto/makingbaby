
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCalendarInvite = (matchId: string) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const sendInvite = async (selectedDate?: Date) => {
    setIsSending(true);

    try {
      // If we have a specific meetingTime, use it; otherwise the edge function will
      // attempt to detect a time from the recent chat messages
      const requestBody = selectedDate 
        ? { 
            matchId, 
            meetingTime: selectedDate.toISOString(), 
            suggestedOnly: false
          }
        : { 
            matchId, 
            suggestedOnly: true
          };

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("You must be logged in to send calendar invites");
      }

      // Call the edge function to send the calendar invite
      const { data, error } = await supabase.functions.invoke('send-calendar-invite', {
        body: requestBody
      });

      if (error) {
        throw new Error(error.message || 'Failed to send calendar invite');
      }

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to send calendar invite');
      }
      
      setIsSent(true);
      return true;
    } catch (error) {
      console.error("Failed to send calendar invite:", error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    isSent,
    setIsSent,
    sendInvite
  };
};
