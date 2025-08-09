
import React from "react";
import { ChatInput } from "../../components/ChatInput";
import { ChatInputErrorBoundary } from "../../components/ChatInputErrorBoundary";
import { MeetingStatusSection } from "./MeetingStatusSection";
import { PartnerInfo } from "../../types";

interface ChatFooterSectionProps {
  hasConfirmedMeeting: boolean;
  formattedMeetingTime: string | null;
  partnerInfo: PartnerInfo | null;
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
  isSending: boolean;
  isUploading: boolean;
  handleUploadFile: (file: File) => void;
  handleDropScheduler?: () => void;
  matchStatus?: string;
}

export const ChatFooterSection: React.FC<ChatFooterSectionProps> = ({
  hasConfirmedMeeting,
  formattedMeetingTime,
  partnerInfo,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
  isSending,
  isUploading,
  handleUploadFile,
  handleDropScheduler,
  matchStatus
}) => {
  // DEBUG: Log props to see what's being passed to ChatFooterSection
  console.log("ChatFooterSection DEBUG:", {
    handleUploadFile: !!handleUploadFile,
    handleDropScheduler: !!handleDropScheduler,
    matchStatus,
    disabled: matchStatus === "completed"
  });
  return (
    <div className="flex-shrink-0">
      {/* Input with Error Boundary */}
      <ChatInputErrorBoundary>
        <ChatInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isSending}
          isUploading={isUploading}
          onUpload={handleUploadFile}
          onDropScheduler={handleDropScheduler}
          disabled={matchStatus === "completed"}
        />
      </ChatInputErrorBoundary>
      
      {/* Meeting status and Upduo Section */}
      <MeetingStatusSection
        hasConfirmedMeeting={hasConfirmedMeeting}
        formattedMeetingTime={formattedMeetingTime}
        partnerInfo={partnerInfo}
      />
    </div>
  );
};
