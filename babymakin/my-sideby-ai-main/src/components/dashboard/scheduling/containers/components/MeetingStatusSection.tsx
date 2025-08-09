
import React from "react";
import { UpduoConversationButton } from "../../components/UpduoConversationButton";
import { PartnerInfo } from "../../types";

interface MeetingStatusSectionProps {
  hasConfirmedMeeting: boolean;
  formattedMeetingTime: string | null;
  partnerInfo: PartnerInfo | null;
}

export const MeetingStatusSection: React.FC<MeetingStatusSectionProps> = ({
  hasConfirmedMeeting,
  formattedMeetingTime,
  partnerInfo
}) => {
  if (!partnerInfo) return null;

  if (hasConfirmedMeeting) {
    return (
      <div className="border-t pt-3 pb-2 px-3 md:px-4">
        <div className="text-sm text-green-700">
          Meeting scheduled for {formattedMeetingTime}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-3 pb-2 px-3 md:px-4">
      <UpduoConversationButton 
        partnerName={partnerInfo.name}
        className="w-full" 
        mode="fullscreen"
      />
    </div>
  );
};
