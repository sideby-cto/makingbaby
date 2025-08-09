
/**
 * Normalize a date to UTC format
 * This function handles potential invalid dates and prevents errors
 */
export const normalizeToUTC = (date: Date | string): string => {
  try {
    // If date is undefined or null, return an empty string
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid before calling toISOString
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to normalizeToUTC:', date);
      return '';
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error normalizing date:', error);
    return '';
  }
};

/**
 * Format a date to user's local timezone
 * Safely handles potentially invalid dates
 */
export const formatToUserTimezone = (date: Date | string): string => {
  try {
    // If date is undefined or null, return indication
    if (!date) return 'Invalid date';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid before formatting
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatToUserTimezone:', date);
      return 'Invalid date';
    }
    
    // Use Intl.DateTimeFormat for better localization
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date to user timezone:', error);
    return 'Invalid date';
  }
};

/**
 * Get the user's timezone
 */
export const getUserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return 'UTC'; // Default to UTC if we can't detect
  }
};

/**
 * Format a date in ISO format to a human-readable date
 */
export const formatDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a time (hour) to a human-readable time
 */
export const formatHour = (hour: number): string => {
  try {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting hour:', error);
    return `${hour}:00`;
  }
};
