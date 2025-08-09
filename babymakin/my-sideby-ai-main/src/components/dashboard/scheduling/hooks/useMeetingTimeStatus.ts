
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MeetingTime } from "../types";

interface MeetingTimeStatus {
  hasMeetingTime: boolean;
  meetingTime: Date | null;
  timeString: string | null;
  isLoading: boolean;
  isConfirmed: boolean;
  refetch: () => Promise<void>;
  // Add the missing properties that other components are using
  formattedMeetingTime: string | null;
  hasConfirmedMeeting: boolean;
  refreshMeetingTime: () => Promise<void>;
}

export const useMeetingTimeStatus = (matchId: string): MeetingTimeStatus => {
  const [isLoading, setIsLoading] = useState(true);
  const [meetingTime, setMeetingTime] = useState<Date | null>(null);
  const [timeString, setTimeString] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formattedMeetingTime, setFormattedMeetingTime] = useState<string | null>(null);

  const fetchMeetingTime = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('match_meeting_times')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching meeting time:", error);
        return;
      }

      if (data && data.length > 0) {
        // Use detected_time as the primary field since 'time' doesn't exist in the database schema
        const meetingTimeStr = data[0].detected_time;
        
        if (meetingTimeStr) {
          const dateObj = new Date(meetingTimeStr);
          setMeetingTime(dateObj);
          setTimeString(meetingTimeStr);
          setIsConfirmed(data[0].status === 'confirmed');
          
          // Format the meeting time for display
          try {
            setFormattedMeetingTime(format(dateObj, "PPpp"));
          } catch (err) {
            console.error("Error formatting date:", err);
            setFormattedMeetingTime(meetingTimeStr);
          }
        }
      }
    } catch (error) {
      console.error("Error in useMeetingTimeStatus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMeetingTime();
    }
  }, [matchId]);

  return {
    hasMeetingTime: !!meetingTime,
    meetingTime,
    timeString,
    isLoading,
    isConfirmed,
    refetch: fetchMeetingTime,
    // Return the new properties
    formattedMeetingTime,
    hasConfirmedMeeting: isConfirmed,
    refreshMeetingTime: fetchMeetingTime
  };
};
