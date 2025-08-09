
import { format, parseISO } from 'date-fns';

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  abbreviation: string;
}

/**
 * Get the user's current timezone information
 */
export const getUserTimezone = (): TimezoneInfo => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  
  // Get timezone offset
  const offsetMinutes = now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const offsetSign = offsetMinutes <= 0 ? '+' : '-';
  const offset = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;
  
  // Get timezone abbreviation
  const abbreviation = new Intl.DateTimeFormat('en', {
    timeZoneName: 'short',
    timeZone: timezone
  }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || '';
  
  return {
    timezone,
    offset,
    abbreviation
  };
};

/**
 * Format a timestamp with timezone awareness
 */
export const formatTimestampWithTimezone = (
  timestamp: string | Date,
  options: {
    includeDate?: boolean;
    includeTimezone?: boolean;
    format12Hour?: boolean;
    userTimezone?: string;
  } = {}
): string => {
  const {
    includeDate = false,
    includeTimezone = true,
    format12Hour = true,
    userTimezone
  } = options;
  
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    const timezone = userTimezone || getUserTimezone().timezone;
    
    let formatString = '';
    
    if (includeDate) {
      formatString += 'MMM d, ';
    }
    
    if (format12Hour) {
      formatString += 'h:mm a';
    } else {
      formatString += 'HH:mm';
    }
    
    let formattedTime = format(date, formatString);
    
    if (includeTimezone) {
      const timezoneInfo = getUserTimezone();
      formattedTime += ` (${timezoneInfo.abbreviation})`;
    }
    
    return formattedTime;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid time';
  }
};

/**
 * Check if two timestamps are from the same day
 */
export const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    
    return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
  } catch (error) {
    return false;
  }
};

/**
 * Get relative time description (Today, Yesterday, etc.)
 */
export const getRelativeTimeDescription = (timestamp: string | Date): string => {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    const now = new Date();
    
    if (isSameDay(date, now)) {
      return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    }
    
    // If it's within the last week, show day name
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return format(date, 'EEEE'); // Day name like "Monday"
    }
    
    return format(date, 'MMM d'); // Month and day like "Jan 15"
  } catch (error) {
    return 'Unknown';
  }
};
