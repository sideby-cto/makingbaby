
import { Calendar, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTimeSlots } from "../matchmaker/utils/matchesUtils";
import { useUserAvailability } from "../matchmaker/hooks/useUserAvailability";

interface UserWithAvailability {
  id: string;
  email: string;
  fullName: string;
  hasAvailability: boolean;
  availabilitySlots?: { day: string, hour: number }[];
}

interface UserListItemProps {
  user: UserWithAvailability;
  isSelected: boolean;
  onSelect: () => void;
}

export const UserListItem = ({ user, isSelected, onSelect }: UserListItemProps) => {
  // Use the hook to get real-time availability data
  const { availabilitySlots, loading } = useUserAvailability(user.id);
  
  // Determine if the user has real availability
  const hasRealAvailability = !loading && availabilitySlots.length > 0;
  
  // Group slots by day for the tooltip
  const getSlotsByDay = () => {
    if (!hasRealAvailability) return [];
    
    const formattedSlots = availabilitySlots.map(slot => {
      // Parse the start time to get the hour
      const timeMatch = slot.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hour = 12; // Default to noon
      
      if (timeMatch) {
        let hourNum = parseInt(timeMatch[1], 10);
        const period = timeMatch[3].toUpperCase();
        
        // Convert to 24-hour format
        if (period === 'PM' && hourNum < 12) hourNum += 12;
        if (period === 'AM' && hourNum === 12) hourNum = 0;
        
        hour = hourNum;
      }
      
      return {
        day: slot.day,
        hour
      };
    });
    
    const slotsByDay: Record<string, number[]> = {};
    
    formattedSlots.forEach(slot => {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot.hour);
    });
    
    return Object.entries(slotsByDay).map(([day, hours]) => ({
      day,
      hours: hours.sort((a, b) => a - b)
    }));
  };
  
  const slotsByDay = getSlotsByDay();
  const slotCount = hasRealAvailability ? availabilitySlots.length : 0;
  
  return (
    <div 
      className={`
        p-3 rounded-md cursor-pointer transition-colors
        ${hasRealAvailability ? 'border border-purple-200 hover:bg-purple-50' : 'border border-gray-200 hover:bg-gray-50'}
        ${isSelected ? (hasRealAvailability ? 'bg-purple-100' : 'bg-gray-100') : ''}
      `}
      onClick={onSelect}
    >
      <div className="font-medium">{user.fullName || "Unnamed User"}</div>
      <div className="text-xs text-gray-500">{user.email}</div>
      
      {loading && (
        <div className="mt-1 text-xs text-gray-400 flex items-center">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Loading...
        </div>
      )}
      
      {!loading && hasRealAvailability ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-1 text-xs flex items-center text-purple-700 cursor-help">
                <Clock className="h-3 w-3 mr-1" />
                {slotCount} {slotCount === 1 ? 'slot' : 'slots'} available
              </div>
            </TooltipTrigger>
            <TooltipContent className="p-2 max-w-xs bg-white border border-purple-100">
              <div className="text-xs space-y-1.5">
                <div className="font-medium">Available times:</div>
                {slotsByDay.map((daySlot, index) => (
                  <div key={index} className="space-y-0.5">
                    <div className="font-medium">{daySlot.day}</div>
                    <div>{formatTimeSlots(daySlot.hours)}</div>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="mt-1 text-xs text-gray-400">
          {!loading && "No availability set"}
        </div>
      )}
    </div>
  );
};
