
import { PacingLevel } from "@/components/dashboard/pacing/types";
import { addDays, format, addWeeks, addMonths, startOfDay, endOfDay } from "date-fns";

/**
 * Calculate the period length in days based on pacing level
 */
export const getPacingPeriodDays = (pacingLevel: PacingLevel | null): number => {
  switch (pacingLevel) {
    case "light":
      return 30; // Monthly
    case "moderate":
      return 14; // Bi-weekly
    case "consistent":
      return 7; // Weekly
    case "deep_dive":
      return 3; // Every few days
    default:
      return 30; // Default to monthly if no pacing level provided
  }
};

/**
 * Calculate the start of the current pacing period
 */
export const getCurrentPacingPeriodStart = (
  pacingLevel: PacingLevel | null,
  userCreatedAt: Date | string | null
): Date => {
  const today = new Date();
  
  // If we don't have a user creation date, use today as reference
  if (!userCreatedAt) {
    return startOfDay(today);
  }
  
  const creationDate = typeof userCreatedAt === "string" 
    ? new Date(userCreatedAt) 
    : userCreatedAt;
  
  const periodDays = getPacingPeriodDays(pacingLevel);
  const daysSinceCreation = Math.floor((today.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysIntoCurrentPeriod = daysSinceCreation % periodDays;
  
  // Calculate the start of the current period
  return startOfDay(addDays(today, -daysIntoCurrentPeriod));
};

/**
 * Get suggested meeting dates based on pacing level
 * Returns dates between p/2 (halfway) and 3p/4 (three-quarters) through the cycle
 */
export const getSuggestedMeetingDates = (
  pacingLevel: PacingLevel | null,
  userCreatedAt: Date | string | null
): { 
  startDate: Date; 
  endDate: Date; 
  isInSuggestedPeriod: boolean;
  daysUntilNextPeriod: number;
} => {
  const periodDays = getPacingPeriodDays(pacingLevel);
  const periodStart = getCurrentPacingPeriodStart(pacingLevel, userCreatedAt);
  
  // Calculate the sweet spot between p/2 and 3p/4
  const halfwayPoint = addDays(periodStart, Math.floor(periodDays / 2));
  const threeQuartersPoint = addDays(periodStart, Math.floor(periodDays * 0.75));
  const periodEnd = addDays(periodStart, periodDays);
  
  const today = new Date();
  const isInSuggestedPeriod = 
    today >= halfwayPoint && 
    today <= threeQuartersPoint;
  
  // Calculate days until next period if we're past the suggested window
  const daysUntilNextPeriod = today > threeQuartersPoint 
    ? Math.ceil((periodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return {
    startDate: halfwayPoint,
    endDate: threeQuartersPoint,
    isInSuggestedPeriod,
    daysUntilNextPeriod
  };
};

/**
 * Get a friendly string for when the best meeting time would be
 */
export const getSuggestedMeetingTimeframe = (
  pacingLevel: PacingLevel | null,
  userCreatedAt: Date | string | null
): string => {
  const { startDate, endDate, isInSuggestedPeriod, daysUntilNextPeriod } = 
    getSuggestedMeetingDates(pacingLevel, userCreatedAt);
  
  if (isInSuggestedPeriod) {
    return "This is a great time to schedule your meeting!";
  } else if (daysUntilNextPeriod > 0) {
    return `Consider scheduling for your next cycle, ${daysUntilNextPeriod} days from now.`;
  } else {
    // We're before the halfway point
    const daysUntilSweetSpot = Math.ceil(
      (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilSweetSpot <= 1) {
      return "Tomorrow would be a perfect time to meet!";
    } else {
      return `In about ${daysUntilSweetSpot} days would be the ideal time to meet.`;
    }
  }
};

/**
 * Generate a suggested meeting time based on pacing level
 * Always suggests dates at least one week out
 */
export const generateSuggestedMeetingTime = (
  pacingLevel: PacingLevel | null,
  userCreatedAt: Date | string | null
): string => {
  const { isInSuggestedPeriod } = getSuggestedMeetingDates(pacingLevel, userCreatedAt);
  
  // Get current date and add at least 7 days
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  // Suggested days of week, prioritizing midweek
  const daysOfWeek = ["Wednesday", "Thursday", "Tuesday", "Monday", "Friday"];
  const suggestedDay = daysOfWeek[Math.floor(Math.random() * 3)]; // Bias toward earlier in array
  
  // Suggested times for business hours (8am-6pm), in 12-hour format
  // Using 9, 10, 11 for AM and 1, 2, 3, 4, 5 for PM (avoiding early morning/late evening)
  const hours = [9, 10, 11, 1, 2, 3, 4, 5];
  const suggestedHour = hours[Math.floor(Math.random() * hours.length)];
  const minutes = ["00", "30"];
  const suggestedMinute = minutes[Math.floor(Math.random() * minutes.length)];
  
  // Determine AM/PM
  const period = (suggestedHour >= 8 && suggestedHour <= 11) ? "am" : "pm";
  
  // Use "next" for the day of the week
  const dayPrefix = "next ";
  
  // If we're not in the suggested period, add some context
  const timeframeContext = isInSuggestedPeriod 
    ? "" 
    : " (for our next learning cycle)";
    
  return `How about ${dayPrefix}${suggestedDay} at ${suggestedHour}:${suggestedMinute}${period}${timeframeContext}?`;
};
