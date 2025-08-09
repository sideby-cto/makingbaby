import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TimeSlot } from "../../types/availability";
import { TimeSlotUtils } from "../../types/availability";
import { User } from "@supabase/supabase-js";

interface UseLoadSavedAvailabilityProps {
  user: User | null;
  timeSlots: TimeSlot[];
  setTimeSlots: (timeSlots: TimeSlot[]) => void;
  setReachedLimit: (reachedLimit: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  MAX_SELECTIONS: number;
}

export const useLoadSavedAvailability = ({
  user,
  timeSlots,
  setTimeSlots,
  setReachedLimit,
  setLoading,
  setError,
  MAX_SELECTIONS
}: UseLoadSavedAvailabilityProps) => {
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadUserAvailability = async () => {
    if (!user) {
      console.log("No user provided to loadUserAvailability");
      setLoadingAvailability(false);
      setLoading(false);
      return;
    }

    try {
      setLoadingAvailability(true);
      setLoadError(null);
      
      console.log("Loading availability for user:", user.id);
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Authentication error:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error("No authenticated user found");
        throw new Error("Authentication required");
      }
      
      console.log("Authenticated as:", authData.user.id);
      
      const { data, error } = await supabase
        .from("user_availability")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching availability data:", error);
        throw error;
      }

      console.log("Availability data fetched:", data);

      if (data && data.length > 0 && data[0].time_slots) {
        console.log("Found saved availability:", data[0].time_slots);
        console.log("Time slots type:", typeof data[0].time_slots);
        
        const savedSlotsMap = new Map<string, any>();
        
        if (Array.isArray(data[0].time_slots)) {
          data[0].time_slots.forEach((savedSlot: any) => {
            if (savedSlot && typeof savedSlot === 'object' && 
                'day' in savedSlot && 'hour' in savedSlot) {
              const formattedDay = TimeSlotUtils.formatDay(savedSlot.day);
              if (formattedDay) {
                const key = TimeSlotUtils.createKey({
                  day: formattedDay,
                  hour: savedSlot.hour
                } as TimeSlot);
                savedSlotsMap.set(key, savedSlot);
              }
            }
          });
        } else {
          console.error("time_slots is not an array:", data[0].time_slots);
        }
        
        console.log("Saved slots count:", savedSlotsMap.size);
        
        const updatedTimeSlots = timeSlots.map(slot => {
          const formattedDay = TimeSlotUtils.formatDay(slot.day);
          
          if (!formattedDay) {
            return slot;
          }
          
          const key = TimeSlotUtils.createKey({
            day: formattedDay,
            hour: slot.hour
          } as TimeSlot);
          const savedSlot = savedSlotsMap.get(key);
          
          if (savedSlot) {
            console.log("Found matching slot:", key);
          }
          
          return {
            ...slot,
            day: formattedDay,
            selected: savedSlot ? true : false
          };
        });
        
        setTimeSlots(updatedTimeSlots);
        
        const selectedCount = updatedTimeSlots.filter(s => s.selected).length;
        setReachedLimit(selectedCount >= MAX_SELECTIONS);
        
        console.log("Updated time slots with saved data, selected count:", selectedCount);
      } else {
        console.log("No saved availability found or empty time_slots array");
      }
    } catch (err) {
      console.error("Error loading availability:", err);
      const errorMessage = (err as Error).message || "Failed to load availability";
      setLoadError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoadingAvailability(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && timeSlots.length > 0) {
      loadUserAvailability();
    }
  }, [user, timeSlots.length]);

  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up real-time subscription for availability changes");
    
    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_availability',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Availability changed:', payload);
          loadUserAvailability();
        }
      )
      .subscribe();
    
    return () => {
      console.log("Removing real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { loadingAvailability, loadError, loadUserAvailability };
};
