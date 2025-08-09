
import { normalizeToUTC } from './timeZoneUtils';

export const normalizeDate = (date: string | Date): string => {
  return normalizeToUTC(date);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(undefined, options);
};

export const formatHour = (hour: number): string => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0); // Set the hour
  return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
};

/**
 * Process availability data to normalize it and associate with user profiles
 */
export const processAvailabilityData = (availabilityData, profilesMap) => {
  const usersWithAvailability = [];
  
  // Group by user and extract relevant data
  const userAvailabilityMap = new Map();
  
  availabilityData.forEach(data => {
    if (!data || !data.user_id) return;
    
    try {
      const userId = data.user_id;
      const profile = profilesMap.get(userId);
      
      // Skip if profile doesn't exist or is inactive
      if (!profile) return;
      
      // Process time slots
      const timeSlots = [];
      if (data.time_slots && Array.isArray(data.time_slots)) {
        data.time_slots.forEach(slot => {
          try {
            if (slot && slot.day && typeof slot.hour === 'number') {
              timeSlots.push({
                day: normalizeDate(slot.day),
                hour: slot.hour
              });
            }
          } catch (error) {
            console.warn(`Error processing time slot for user ${userId}:`, error);
          }
        });
      }
      
      // Store pacing level
      const pacingLevel = data.pacing_level || 5;
      
      // If this user already has an entry, append to it
      if (userAvailabilityMap.has(userId)) {
        const existing = userAvailabilityMap.get(userId);
        existing.timeSlots.push(...timeSlots);
      } else {
        userAvailabilityMap.set(userId, {
          profile,
          timeSlots,
          pacingLevel
        });
      }
    } catch (error) {
      console.error(`Error processing availability for user:`, error);
    }
  });
  
  // Convert map to array
  userAvailabilityMap.forEach((data, userId) => {
    if (data.profile && data.timeSlots.length > 0) {
      usersWithAvailability.push({
        id: userId,
        ...data.profile,
        timeSlots: data.timeSlots,
        pacingLevel: data.pacingLevel
      });
    }
  });
  
  return usersWithAvailability;
};

/**
 * Find availability matches between users
 * @param users - Array of processed user data with availability
 * @param rawAvailabilityData - Optional raw availability data if needed
 * @param config - Optional configuration for matching
 */
export const findAvailabilityMatches = (
  users,
  rawAvailabilityData?,
  config = { requireExactMatch: false }
) => {
  const matches = [];
  const userAvailability = {};

  // If raw availability data is provided, use it
  if (rawAvailabilityData) {
    rawAvailabilityData.forEach(slot => {
      if (!userAvailability[slot.user_id]) {
        userAvailability[slot.user_id] = [];
      }
      
      try {
        const normalizedDay = normalizeDate(slot.day);
        if (normalizedDay) {
          userAvailability[slot.user_id].push({
            day: normalizedDay,
            hour: slot.hour
          });
        }
      } catch (error) {
        console.warn(`Skipping problematic availability slot for user ${slot.user_id}:`, error);
      }
    });
  } else {
    // Use processed data directly from users array
    users.forEach(user => {
      if (user.timeSlots && Array.isArray(user.timeSlots)) {
        userAvailability[user.id] = user.timeSlots;
      }
    });
  }

  // Skip users with no valid availability slots
  const usersWithAvailability = users.filter(
    user => userAvailability[user.id] && userAvailability[user.id].length > 0
  );

  // Compare each user with every other user
  usersWithAvailability.forEach((user1, i) => {
    usersWithAvailability.slice(i + 1).forEach(user2 => {
      const user1Slots = userAvailability[user1.id] || [];
      const user2Slots = userAvailability[user2.id] || [];
      
      if (!user1Slots.length || !user2Slots.length) return;

      const overlappingSlots = [];
      const proximitySlots = [];

      user1Slots.forEach(slot1 => {
        user2Slots.forEach(slot2 => {
          try {
            if (slot1.day === slot2.day) {
              if (slot1.hour === slot2.hour) {
                overlappingSlots.push({
                  day: slot1.day,
                  hours: [slot1.hour]
                });
              } else if (Math.abs(slot1.hour - slot2.hour) <= 2) {
                proximitySlots.push({
                  day: slot1.day,
                  user1Hour: slot1.hour,
                  user2Hour: slot2.hour,
                  hourDifference: Math.abs(slot1.hour - slot2.hour)
                });
              }
            }
          } catch (error) {
            console.warn('Error comparing time slots:', error);
          }
        });
      });

      if (overlappingSlots.length > 0) {
        matches.push({
          user1,
          user2,
          matchType: 'exact',
          score: overlappingSlots.length,
          overlappingSlots,
          proximitySlots: []
        });
      } else if (!config.requireExactMatch && proximitySlots.length > 0) {
        matches.push({
          user1,
          user2,
          matchType: 'proximity',
          score: proximitySlots.length,
          overlappingSlots: [],
          proximitySlots
        });
      }
    });
  });

  return matches.sort((a, b) => b.score - a.score);
};

