
import { useCallback } from "react";
import type { TimeSlot } from "../../types/availability";

interface UseTimeSlotToggleProps {
  timeSlots: TimeSlot[];
  setTimeSlots: (timeSlots: TimeSlot[]) => void;
  setReachedLimit: (reachedLimit: boolean) => void;
  MAX_SELECTIONS: number;
  toast: any;
}

export const useTimeSlotToggle = ({
  timeSlots,
  setTimeSlots,
  setReachedLimit,
  MAX_SELECTIONS,
  toast
}: UseTimeSlotToggleProps) => {
  const toggleTimeSlot = useCallback((index: number) => {
    const slot = timeSlots[index];
    
    // If already selected, we can always deselect
    if (slot.selected) {
      const updatedTimeSlots = [...timeSlots];
      updatedTimeSlots[index] = { ...slot, selected: false };
      
      setTimeSlots(updatedTimeSlots);
      setReachedLimit(false);
      return;
    }
    
    // If not selected, check if we've reached the limit
    const selectedCount = timeSlots.filter(s => s.selected).length;
    
    if (selectedCount >= MAX_SELECTIONS) {
      toast({
        title: "Maximum selection reached",
        description: `You can only select up to ${MAX_SELECTIONS} time slots.`,
        variant: "destructive"
      });
      return;
    }
    
    // If we haven't reached the limit, select the slot
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index] = { ...slot, selected: true };
    
    setTimeSlots(updatedTimeSlots);
    
    // Check if we've reached the limit after this selection
    if (selectedCount + 1 >= MAX_SELECTIONS) {
      setReachedLimit(true);
      toast({
        title: "Maximum selection reached",
        description: `You've selected the maximum of ${MAX_SELECTIONS} time slots.`
      });
    }
  }, [timeSlots, setTimeSlots, setReachedLimit, MAX_SELECTIONS, toast]);

  return { toggleTimeSlot };
};
