
import React from "react";
import { format } from "date-fns";

/**
 * Formats a time slot hour into a readable format (e.g., 13 -> "1:00 PM")
 */
export const formatTimeSlot = (hour: number): string => {
  const date = new Date();
  date.setHours(hour, 0, 0);
  return format(date, 'h:mm a');
};

/**
 * Formats a day and hour into a readable format (e.g., "Monday at 2:00 PM")
 */
export const formatSlotDayAndTime = (day: string, hour: number): string => {
  const dayDate = new Date(day);
  const dayName = format(dayDate, 'EEEE');
  
  const timeStr = formatTimeSlot(hour);
  return `${dayName} at ${timeStr}`;
};

/**
 * Groups time slots by day
 */
export const groupSlotsByDay = (timeSlots: Array<{ day: string; hour: number; selected?: boolean }>): Record<string, typeof timeSlots> => {
  const result: Record<string, typeof timeSlots> = {};
  
  timeSlots.forEach(slot => {
    if (!result[slot.day]) {
      result[slot.day] = [];
    }
    result[slot.day].push(slot);
  });
  
  return result;
};
