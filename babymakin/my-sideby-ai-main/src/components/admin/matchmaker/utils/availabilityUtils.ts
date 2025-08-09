
import { AvailabilitySlot, SlotsByDay } from "../types/availability";
import { format } from "date-fns";

/**
 * Groups availability slots by day
 */
export const groupSlotsByDay = (slots: AvailabilitySlot[]): SlotsByDay => {
  const groupedSlots: SlotsByDay = {};
  
  slots.forEach(slot => {
    if (!groupedSlots[slot.day]) {
      groupedSlots[slot.day] = [];
    }
    groupedSlots[slot.day].push(slot);
  });
  
  // Sort days chronologically
  return Object.fromEntries(
    Object.entries(groupedSlots)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
  );
};

/**
 * Formats a list of hours into a readable time range string
 */
export const formatTimeSlots = (hours: number[]): string => {
  if (!hours || hours.length === 0) return 'No times available';
  
  const formatHour = (hour: number) => {
    const hourDisplay = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${hourDisplay}:00 ${period}`;
  };
  
  return hours
    .sort((a, b) => a - b)
    .map(formatHour)
    .join(', ');
};

/**
 * Formats a date as a readable string
 */
export const formatAvailabilityDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'EEE, MMM d');
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Formats a pacing level into a readable string
 */
export const formatPacingLevel = (level: string): string => {
  if (!level) return 'Not set';
  
  // Format with capitalization and replace underscores with spaces
  return level
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
