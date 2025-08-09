
// Updated type definition file

// Extended TimeSlot with additional properties needed for the UI
export interface TimeSlot {
  day: string;
  hour: number;
  selected: boolean;
  start_time?: string;
  end_time?: string;
}

export interface UserAvailability {
  userId: string;
  timeSlots: TimeSlot[];
}

export interface AvailabilityRange {
  start: Date;
  end: Date;
}

/**
 * Helper functions for TimeSlot handling
 */
export const TimeSlotUtils = {
  /**
   * Creates a consistent key for a time slot
   */
  createKey: (slot: TimeSlot): string => {
    return `${slot.day}-${slot.hour}`;
  },

  /**
   * Formats a Date or string to a consistent date string format (YYYY-MM-DD)
   */
  formatDay: (day: Date | string | null): string | null => {
    if (!day) return null;
    
    if (typeof day === 'string') {
      // Handle ISO string or date string
      try {
        const dateObj = new Date(day);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
        // If it already looks like YYYY-MM-DD just return it
        if (/^\d{4}-\d{2}-\d{2}/.test(day)) {
          return day.split('T')[0];
        }
      } catch (e) {
        console.error("Error formatting day string:", e);
      }
      return day;
    }
    
    // Handle Date object
    try {
      return day.toISOString().split('T')[0];
    } catch (e) {
      console.error("Error formatting Date object:", e);
      return null;
    }
  }
};
