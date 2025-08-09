
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle } from "lucide-react";
import { useTimeDetection } from "../../hooks/useTimeDetection";
import { useCalendarInvite } from "../../hooks/useCalendarInvite";

interface CalendarInviteButtonProps {
  matchId: string;
  meetingTime?: Date;
  onInviteSent: () => void;
}

export const CalendarInviteButton = ({ 
  matchId,
  meetingTime,
  onInviteSent
}: CalendarInviteButtonProps) => {
  const { isSent } = useCalendarInvite(matchId);
  const { isSending, isDetecting, handleSendInvite, detectMeetingTime } = useTimeDetection({
    matchId,
    meetingTime,
    onInviteSent
  });

  if (isSent) {
    return (
      <Button 
        variant="outline" 
        className="w-full text-success border-success/30 bg-success/10 hover:bg-success/20 hover:text-success flex items-center" 
        disabled
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Calendar invite sent
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      className="w-full"
      onClick={meetingTime ? handleSendInvite : detectMeetingTime}
      disabled={isSending || isDetecting}
    >
      <Calendar className="mr-2 h-4 w-4" />
      Send Calendar Invite
    </Button>
  );
};
