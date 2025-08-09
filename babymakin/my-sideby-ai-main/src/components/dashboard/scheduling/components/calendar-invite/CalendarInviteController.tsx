import React, { useState } from "react";
import { CalendarInviteButton } from "./CalendarInviteButton";
import { CalendarInviteDialog } from "./CalendarInviteDialog";
import { TimeConfirmationDialog } from "./TimeConfirmationDialog";
import { Notification } from "@/components/ui/notification";
import { useTimeDetection } from "../../hooks/useTimeDetection";
import { Button } from "@/components/ui/button";

interface CalendarInviteControllerProps {
  matchId: string;
  meetingTime?: Date;
  onInviteSent: () => void;
}

export const CalendarInviteController = ({
  matchId,
  meetingTime,
  onInviteSent
}: CalendarInviteControllerProps) => {
  // Explicitly handle loading state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setCustomErrorMessage] = useState<string | null>(null);
  
  const {
    isDetecting,
    isSending,
    errorMessage: hookErrorMessage,
    detectedMeetingTime,
    selectedDate,
    setSelectedDate,
    isDateDialogOpen,
    setIsDateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    detectMeetingTime,
    handleSendInvite
  } = useTimeDetection({
    matchId,
    meetingTime,
    onInviteSent
  });

  // Combine loading states
  const combinedIsLoading = isLoading || isDetecting || isSending;
  // Combine error messages
  const displayedErrorMessage = errorMessage || hookErrorMessage;

  const handleInviteClick = async () => {
    setIsLoading(true);
    try {
      if (meetingTime) {
        // If we already have a meeting time, send calendar invite directly
        await handleSendInvite();
      } else {
        // Otherwise, trigger the meeting time detection flow
        await detectMeetingTime();
      }
    } catch (error) {
      console.error("Calendar invite error:", error);
      setCustomErrorMessage(
        error instanceof Error 
          ? error.message 
          : "There was a problem with the calendar invite"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {displayedErrorMessage && (
        <div className="mb-2">
          <Notification
            variant="error"
            title="Error"
            description={displayedErrorMessage}
            onClose={() => setCustomErrorMessage(null)}
          />
        </div>
      )}
      
      {/* Simplified button with more visible styling */}
      <Button
        variant="default"
        size="sm"
        disabled={combinedIsLoading}
        onClick={handleInviteClick}
        className="w-full flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        {combinedIsLoading ? "Processing..." : "Send Calendar Invite"}
      </Button>

      {/* Manual Date Selection Dialog */}
      <CalendarInviteDialog
        open={isDateDialogOpen}
        onClose={() => setIsDateDialogOpen(false)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onConfirm={handleSendInvite}
        isSending={isSending}
        errorMessage={displayedErrorMessage}
      />

      {/* Confirmation Dialog for Detected Time */}
      <TimeConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        detectedTime={detectedMeetingTime}
        onConfirm={handleSendInvite}
        onEdit={() => {
          setIsConfirmDialogOpen(false);
          setIsDateDialogOpen(true);
        }}
      />
    </>
  );
};
