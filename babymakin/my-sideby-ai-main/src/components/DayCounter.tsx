
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";
import { JourneyResetAcknowledgment } from "@/components/journey/JourneyResetAcknowledgment";
import { useJourneyResetAcknowledgment } from "@/hooks/useJourneyResetAcknowledgment";

interface DayCounterProps {
  userId: string;
}

export const DayCounter = ({
  userId
}: DayCounterProps) => {
  const [dayCount, setDayCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    showAcknowledgment,
    resetDate,
    acknowledgeReset,
    isLoading: acknowledgeLoading
  } = useJourneyResetAcknowledgment({ userId });

  useEffect(() => {
    const fetchJourneyStartDate = async () => {
      try {
        setIsLoading(true);

        // Get the user's profile which contains the journey start date
        const {
          data,
          error
        } = await supabase.from("profiles").select("journey_start_date").eq("id", userId).single();
        
        if (error) {
          console.error("Error fetching user journey start date:", error);
          return;
        }
        
        if (data && data.journey_start_date) {
          const journeyStartDate = new Date(data.journey_start_date);
          const today = new Date();

          // Calculate days difference (rounded down to whole days)
          const days = differenceInDays(today, journeyStartDate);

          // Set day count (or 0 if it's less than a day)
          setDayCount(Math.max(0, days));
        }
      } catch (error) {
        console.error("Error in fetchJourneyStartDate:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchJourneyStartDate();
    }
  }, [userId]);

  if (isLoading || acknowledgeLoading) {
    return <span className="text-sm text-gray-400 flex items-center ml-2">
      <Calendar className="h-3 w-3 mr-1" />
      Loading...
    </span>;
  }

  if (dayCount === null) {
    return null;
  }

  // Return the day count display with acknowledgment overlay if needed
  return (
    <>
      <span className="text-sm text-gray-500 flex items-center ml-2">
        <Calendar className="h-3 w-3 mr-1" />
        Day {dayCount}
      </span>
      
      {showAcknowledgment && (
        <JourneyResetAcknowledgment
          onAcknowledge={acknowledgeReset}
          resetDate={resetDate}
        />
      )}
    </>
  );
};
