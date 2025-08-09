
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface UseUserAvailabilityReturn {
  availabilitySlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  pacingLevel: string | null;
  refreshAvailability: () => void;
}

export const useUserAvailability = (userId: string): UseUserAvailabilityReturn => {
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pacingLevel, setPacingLevel] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Function to fetch availability for a specific user
  const fetchAvailability = useCallback(async () => {
    if (!userId) {
      setAvailabilitySlots([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching availability for user ID: ${userId}`);
      
      // Use select() instead of maybeSingle() to avoid errors with multiple records
      const { data, error: availabilityError } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (availabilityError) {
        console.error("Error fetching availability:", availabilityError);
        setError(`Failed to load availability: ${availabilityError.message}`);
        setAvailabilitySlots([]);
        setLoading(false);
        return;
      }
      
      // Fetch user pacing level - again using select() instead of maybeSingle()
      const { data: pacingData, error: pacingError } = await supabase
        .from('user_pacing_preferences')
        .select('pacing_level')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (pacingError) {
        console.error("Error fetching pacing level:", pacingError);
      } else if (pacingData && pacingData.length > 0) {
        setPacingLevel(pacingData[0].pacing_level);
      }
      
      console.log("Availability data:", data?.[0] || null);
      
      if (data && data.length > 0 && data[0].time_slots) {
        const formattedSlots: TimeSlot[] = [];
        
        if (Array.isArray(data[0].time_slots)) {
          data[0].time_slots.forEach((slot: any) => {
            // Log each slot for debugging
            console.log("Processing slot:", JSON.stringify(slot));
            
            // Handle various formats of time slots
            if (slot.startTime && slot.endTime && slot.day) {
              // Format #1: Already has startTime and endTime
              formattedSlots.push({
                day: slot.day,
                startTime: slot.startTime,
                endTime: slot.endTime
              });
            } else if (slot.start_time && slot.end_time && slot.day) {
              // Format #2: Has start_time and end_time (snake_case)
              formattedSlots.push({
                day: slot.day,
                startTime: slot.start_time,
                endTime: slot.end_time
              });
            } else if (typeof slot.hour === 'number') {
              // Format #3: Legacy format with hour
              const hour = slot.hour;
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 || 12;
              const startTime = `${hour12}:00 ${ampm}`;
              const endTime = `${hour12}:30 ${ampm}`;
              
              formattedSlots.push({
                day: slot.day,
                startTime,
                endTime
              });
            }
          });
        }
        
        setAvailabilitySlots(formattedSlots);
        console.log(`Successfully loaded ${formattedSlots.length} availability slots`);
      } else {
        setAvailabilitySlots([]);
        console.log("No availability data found or slots array is empty");
      }
    } catch (err) {
      console.error("Unexpected error fetching availability:", err);
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
      setAvailabilitySlots([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch and refresh function
  const refreshAvailability = useCallback(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Load availability on component mount or when userId changes
  useEffect(() => {
    refreshAvailability();
  }, [userId, refreshAvailability]);

  return {
    availabilitySlots,
    loading,
    error,
    pacingLevel,
    refreshAvailability
  };
};
