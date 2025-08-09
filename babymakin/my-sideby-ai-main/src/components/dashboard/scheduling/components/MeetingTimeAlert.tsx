
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Calendar, Globe } from "lucide-react";
import { getSuggestedMeetingTimeframe } from "../utils/pacingTimeUtils";
import { PacingLevel } from "@/components/dashboard/communities/types";

interface MeetingTimeAlertProps {
  isBetaUser?: boolean;
  hasConfirmedMeeting?: boolean;
  formattedMeetingTime?: string;
  pacingLevel: string;
  userCreatedAt: string;
  getSuggestedTimeMessage: () => string;
  setNewMessage: (message: string) => void;
}

export const MeetingTimeAlert: React.FC<MeetingTimeAlertProps> = ({
  isBetaUser,
  hasConfirmedMeeting,
  formattedMeetingTime,
  pacingLevel,
  userCreatedAt,
  getSuggestedTimeMessage,
  setNewMessage
}) => {
  if (!isBetaUser) return null;
  
  if (hasConfirmedMeeting && formattedMeetingTime) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <div className="font-medium text-green-800">Meeting Scheduled!</div>
            <AlertDescription className="text-green-700">
              {formattedMeetingTime}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }
  
  if (isBetaUser && !hasConfirmedMeeting) {
    // Cast the string to PacingLevel type to satisfy the TypeScript compiler
    const timeframeMessage = getSuggestedMeetingTimeframe(pacingLevel as PacingLevel, userCreatedAt);
    
    return (
      <Alert className="bg-blue-50 border-blue-200 mb-4">
        <div className="flex">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <div className="font-medium text-blue-800">Schedule Your Learning Session</div>
            <AlertDescription className="text-blue-700">
              <p>Set up a time for your 18-minute learning session. {timeframeMessage}</p>
              <div className="mt-1 flex items-center">
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 underline mr-2"
                  onClick={() => {
                    setNewMessage(getSuggestedTimeMessage());
                  }}
                >
                  Insert suggested time
                </button>
                <span className="text-xs flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  Times will be microtranslated to each person's time zone
                </span>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }
  
  return null;
};
