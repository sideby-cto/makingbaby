
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useCalendarInvite } from "./useCalendarInvite";

interface UseTimeDetectionProps {
  matchId: string;
  meetingTime?: Date;
  onInviteSent: () => void;
}

export const useTimeDetection = ({
  matchId,
  meetingTime,
  onInviteSent
}: UseTimeDetectionProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedMeetingTime, setDetectedMeetingTime] = useState<Date | undefined>(undefined);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(meetingTime);
  const { toast } = useToast();
  const { sendInvite, isSending } = useCalendarInvite(matchId);

  // Function to detect meeting time from recent messages
  const detectMeetingTime = async () => {
    setIsDetecting(true);
    setErrorMessage(null);

    try {
      // Get the most recent message to analyze
      const { data: messages } = await supabase
        .from('match_scheduling_messages')
        .select('id, content')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (!messages || messages.length === 0) {
        setIsDateDialogOpen(true);
        setIsDetecting(false);
        return;
      }

      const latestMessage = messages[0];
      
      // Call the edge function to analyze message for meeting time
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("You must be logged in to detect meeting times");
      }

      const { data, error } = await supabase.functions.invoke('analyze-meeting-time', {
        body: { messageId: latestMessage.id }
      });

      if (error) {
        throw new Error(error.message || 'Failed to detect meeting time');
      }

      const result = data;
      
      if (result.detected) {
        // If a meeting time was detected, show confirmation dialog
        setDetectedMeetingTime(new Date(result.meetingTime.detected_time));
        setSelectedDate(new Date(result.meetingTime.detected_time));
        setIsConfirmDialogOpen(true);
      } else {
        // If no meeting time was detected, show manual date selection dialog
        setIsDateDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to detect meeting time:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to detect meeting time";
      setErrorMessage(errorMsg);
      // Show manual date selection as fallback
      setIsDateDialogOpen(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSendInvite = async () => {
    try {
      await sendInvite(selectedDate);
      onInviteSent();
      
      // Close dialogs
      setIsDateDialogOpen(false);
      setIsConfirmDialogOpen(false);
      
      toast({
        title: "Calendar invite sent!",
        description: selectedDate 
          ? `Invite sent for ${format(selectedDate, "PPp")}`
          : "Calendar invite has been sent to both participants",
        variant: "default"
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to send calendar invite";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  return {
    isDetecting,
    isSending,
    errorMessage,
    detectedMeetingTime,
    selectedDate,
    setSelectedDate,
    isDateDialogOpen,
    setIsDateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    detectMeetingTime,
    handleSendInvite
  };
};
