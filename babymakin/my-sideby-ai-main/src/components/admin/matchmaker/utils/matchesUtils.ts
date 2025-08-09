
// Format an array of hours into a readable string
export const formatTimeSlots = (hours: number[]): string => {
  if (!hours || hours.length === 0) return "No times available";
  
  return hours
    .map(hour => {
      const ampm = hour < 12 ? 'am' : 'pm';
      const displayHour = hour % 12 || 12;
      return `${displayHour}${ampm}`;
    })
    .join(', ');
};

// Format a date for display in messages
export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
};

// Format match date for the MatchItem component
export const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Get a display name for a user
export const getUserDisplayName = (firstName: string | null, lastName: string | null): string => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return "Unknown User";
  }
};

// Group availability slots by day
export const groupSlotsByDay = (slots: Array<{ day: string; hour: number }>) => {
  const grouped: Record<string, number[]> = {};
  
  slots.forEach(slot => {
    if (!grouped[slot.day]) {
      grouped[slot.day] = [];
    }
    grouped[slot.day].push(slot.hour);
  });
  
  return grouped;
};
