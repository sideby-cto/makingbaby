import { addDays, format } from "https://esm.sh/date-fns@2.30.0";
/**
 * Generate mock time slots when the OpenAI processing fails
 */ export function generateMockTimeSlots(daysToInclude = 14) {
  const today = new Date();
  const slots = [];
  for(let i = 1; i <= 5; i++){
    const dayOffset = Math.floor(Math.random() * daysToInclude) + 1;
    const date = addDays(today, dayOffset);
    // Generate a random hour between 9 AM and 5 PM
    const hour = 9 + Math.floor(Math.random() * 8);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    slots.push({
      day: format(date, "EEEE, MMMM do"),
      startTime: `${hour12}:00 ${period}`,
      endTime: `${hour12}:18 ${period}`
    });
  }
  return slots;
}
