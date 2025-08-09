
/**
 * Utility functions for validating time-related inputs in messages
 */

export function validateTimeInMessage(message: string): { 
  isValid: boolean;
  extractedTime?: string;
  reason?: string;
} {
  // Check if message contains a time
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\b/i;
  const timeMatch = message.match(timeRegex);
  
  if (!timeMatch) {
    // No time found, message is valid
    return { isValid: true };
  }
  
  // Extract time components
  const hours = parseInt(timeMatch[1]);
  const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
  const period = timeMatch[3].toLowerCase();
  
  // Calculate 24-hour format for easy comparison
  let hour24 = period === 'pm' && hours !== 12 ? hours + 12 : hours;
  if (period === 'am' && hours === 12) {
    hour24 = 0;
  }
  
  // Business hours are 8 AM to 6 PM (8 to 18 in 24-hour format)
  const isValidHour = hour24 >= 8 && hour24 <= 18;
  
  // Edge case: 6 PM is allowed but not 6:01 PM or later
  const isValidEdgeCase = hour24 === 18 && minutes === 0;
  
  if (isValidHour && (hour24 < 18 || isValidEdgeCase)) {
    return { isValid: true };
  }
  
  return { 
    isValid: false, 
    extractedTime: timeMatch[0],
    reason: "Time must be between 8 AM and 6 PM"
  };
}

/**
 * Extract all time references from a message
 */
export function extractTimesFromMessage(message: string): string[] {
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\b/gi;
  return message.match(timeRegex) || [];
}
