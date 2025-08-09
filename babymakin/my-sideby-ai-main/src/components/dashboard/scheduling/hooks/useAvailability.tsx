import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLoadSavedAvailability } from "./availability/useLoadSavedAvailability";
import { useSaveAvailability } from "./availability/useSaveAvailability";
import { useTimeSlotToggle } from "./availability/useTimeSlotToggle";
import type { TimeSlot } from "../types/availability";
import { TimeSlotUtils } from "../types/availability";
import { startOfDay, addDays, format } from "date-fns";

export const useAvailability = (userPacing: string) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reachedLimit, setReachedLimit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const MAX_SELECTIONS = 5;
  
  const { toast } = useToast();
  const { user, supabaseUser } = useAuth();

  useEffect(() => {
    setError(null);
    setIsInitialized(false);
  }, [user?.id]);
  
  useEffect(() => {
    if (!isInitialized) {
      console.log("Initializing time slots, user:", user?.id);
      const slots: TimeSlot[] = [];
      const today = startOfDay(new Date());
      
      const startDay = 7;
      
      for (let day = 0; day < 7; day++) {
        const date = addDays(today, startDay + day);
        const formattedDay = format(date, 'yyyy-MM-dd');
        
        for (let hour = 8; hour < 18; hour++) {
          const startTime = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
          const endTime = `${hour % 12 || 12}:30 ${hour >= 12 ? 'PM' : 'AM'}`;
          
          slots.push({
            day: formattedDay,
            hour,
            selected: false,
            start_time: startTime,
            end_time: endTime
          });
        }
      }
      
      setTimeSlots(slots);
      setIsInitialized(true);
      console.log("Time slots initialized:", slots.length);
    }
  }, [isInitialized, user]);
  
  const { loadingAvailability, loadError, loadUserAvailability } = useLoadSavedAvailability({
    user: supabaseUser,
    timeSlots,
    setTimeSlots,
    setReachedLimit,
    setLoading,
    setError,
    MAX_SELECTIONS
  });
  
  const { toggleTimeSlot } = useTimeSlotToggle({
    timeSlots,
    setTimeSlots,
    setReachedLimit,
    MAX_SELECTIONS,
    toast
  });
  
  const { saveAvailability, saveError } = useSaveAvailability({
    user: supabaseUser,
    userPacing,
    timeSlots,
    setSaving,
    setError,
    toast
  });

  const handleSaveAvailability = useCallback(async () => {
    try {
      await saveAvailability();
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
        loadUserAvailability();
      }, 500);
    } catch (err) {
      console.error("Error saving availability:", err);
    }
  }, [saveAvailability, loadUserAvailability]);

  useEffect(() => {
    if (refreshTrigger > 0 && supabaseUser) {
      console.log("Refresh triggered, reloading availability");
      loadUserAvailability();
    }
  }, [refreshTrigger, supabaseUser, loadUserAvailability]);

  const combinedError = error || loadError || saveError;

  return {
    timeSlots,
    setTimeSlots,
    saving,
    loading,
    error: combinedError,
    toggleTimeSlot,
    saveAvailability: handleSaveAvailability,
    reachedLimit,
    MAX_SELECTIONS
  };
};
