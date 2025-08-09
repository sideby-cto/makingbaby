
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TimeSlot } from "../../types/availability";
import { TimeSlotUtils } from "../../types/availability";
import { User } from "@supabase/supabase-js";

interface UseSaveAvailabilityProps {
  user: User | null;
  userPacing: string;
  timeSlots: TimeSlot[];
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  toast: ReturnType<typeof useToast>["toast"];
}

export const useSaveAvailability = ({
  user,
  userPacing,
  timeSlots,
  setSaving,
  setError,
  toast
}: UseSaveAvailabilityProps) => {
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveAvailability = useCallback(async () => {
    if (!user) {
      const errorMsg = "You must be logged in to save availability";
      setSaveError(errorMsg);
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaveError(null);

      // Verify authentication
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error("Authentication failed. Please try logging in again.");
      }
      
      if (!authData.user) {
        throw new Error("Authentication required. Please log in.");
      }
      
      console.log("Authenticated as:", authData.user.id, "for user:", user.id);

      // Get only selected time slots
      const selectedTimeSlots = timeSlots.filter(slot => slot.selected);
      console.log("Saving selected time slots:", selectedTimeSlots);

      if (selectedTimeSlots.length === 0) {
        console.log("No time slots selected to save");
        toast({
          title: "Warning",
          description: "No time slots were selected. Your availability won't be used for matching.",
          variant: "default"
        });
      }

      // Check if user already has an availability record
      const { data: existingData, error: fetchError } = await supabase
        .from("user_availability")
        .select("id")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error("Error checking existing availability:", fetchError);
        throw fetchError;
      }

      const hasExistingRecord = existingData && existingData.length > 0;
      console.log("Has existing availability record:", hasExistingRecord);
      
      // Convert TimeSlot[] to a JSON-compatible format with consistent property structure
      // Ensure each slot has both hour and day in proper format
      const timeSlotJSON = selectedTimeSlots.map(slot => {
        // Ensure consistent date format for day
        const formattedDay = TimeSlotUtils.formatDay(slot.day);
        
        if (!formattedDay) {
          console.error("Invalid day format:", slot.day);
          throw new Error("Invalid day format in time slot");
        }
            
        // Extract hour from the slot
        const hour = typeof slot.hour === 'number' ? slot.hour : 12; // Default to noon if not a number
        
        // Create formatted time strings for UI display
        const startTime = slot.start_time || `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        const endTime = slot.end_time || `${hour % 12 || 12}:30 ${hour >= 12 ? 'PM' : 'AM'}`;
        
        // Create an object with standardized properties
        return {
          day: formattedDay,
          hour: hour,
          selected: true,
          start_time: startTime,
          end_time: endTime
        };
      });
      
      console.log("Formatted time slots for database:", timeSlotJSON);
      
      let result;
      const recordId = hasExistingRecord ? existingData[0].id : null;
      
      if (hasExistingRecord) {
        // Update existing record
        console.log("Updating existing availability record");
        result = await supabase
          .from("user_availability")
          .update({
            time_slots: timeSlotJSON,
            pacing_level: userPacing,
            updated_at: new Date().toISOString()
          })
          .eq("id", recordId);
      } else {
        // Create new record with all required fields
        console.log("Creating new availability record");
        const newAvailability = {
          user_id: user.id,
          time_slots: timeSlotJSON,
          pacing_level: userPacing,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        result = await supabase
          .from("user_availability")
          .insert(newAvailability);
      }

      if (result.error) {
        console.error("Database error:", result.error);
        throw result.error;
      }

      console.log("Availability saved successfully");
      toast({
        title: "Success",
        description: "Your availability has been saved successfully",
        variant: "default"
      });
      
    } catch (err) {
      console.error("Error saving availability:", err);
      const errorMessage = (err as Error).message || "Failed to save availability";
      setSaveError(errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [user, timeSlots, userPacing, setSaving, setError, toast]);

  return { saveAvailability, saveError };
};
