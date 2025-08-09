import { format } from "date-fns";
import { Check, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatTimeSlot } from "./utils/timeSlotUtils";
import type { TimeSlot } from "./types/availability";

interface DaySlotProps {
  day: string;
  slots: TimeSlot[];
  toggleTimeSlot: (index: number) => void;
  findTimeSlotIndex: (slot: TimeSlot) => number;
  reachedLimit: boolean;
}

export const DaySlots = ({ day, slots, toggleTimeSlot, findTimeSlotIndex, reachedLimit }: DaySlotProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white hover:border-secondary-200 transition-colors">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
        <h3 className="font-medium text-gray-800">{format(new Date(day), "EEEE, MMMM d")}</h3>
      </div>
      <div className="grid gap-3">
        {slots.map((slot) => {
          const originalIndex = findTimeSlotIndex(slot);
          
          return (
            <Badge
              key={`${day}-${slot.hour}`}
              variant="outline"
              className={`flex items-center justify-between py-2 px-4 h-10 cursor-pointer transition-all ${
                slot.selected 
                  ? "bg-secondary-100 border-secondary-300 text-secondary-700 font-medium" 
                  : reachedLimit && !slot.selected 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-white text-gray-700 hover:bg-secondary-50"
              }`}
              onClick={() => !reachedLimit || slot.selected ? toggleTimeSlot(originalIndex) : null}
            >
              <span className="text-sm font-medium">{formatTimeSlot(slot.hour)}</span>
              {slot.selected ? (
                <Check className="h-4 w-4 text-secondary-600" />
              ) : (
                <Clock className="h-4 w-4 text-gray-400" />
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  toggleTimeSlot: (index: number) => void;
  reachedLimit: boolean;
  maxSelections: number;
}

export const TimeSlotSelector = ({ 
  timeSlots, 
  toggleTimeSlot, 
  reachedLimit, 
  maxSelections 
}: TimeSlotSelectorProps) => {
  // Group time slots by day
  const slotsByDay: Record<string, TimeSlot[]> = {};
  
  timeSlots.forEach(slot => {
    if (!slotsByDay[slot.day]) {
      slotsByDay[slot.day] = [];
    }
    slotsByDay[slot.day].push(slot);
  });
  
  const findTimeSlotIndex = (slot: TimeSlot) => {
    return timeSlots.findIndex(s => 
      s.day === slot.day && s.hour === slot.hour
    );
  };
  
  const selectedCount = timeSlots.filter(slot => slot.selected).length;
  
  return (
    <div className="space-y-4">
      <Alert className={`${selectedCount === 0 ? 'bg-orange-50 border-orange-200' : reachedLimit ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <AlertCircle className={`h-4 w-4 ${selectedCount === 0 ? 'text-orange-600' : reachedLimit ? 'text-blue-600' : 'text-green-600'}`} />
        <AlertDescription>
          {selectedCount === 0 
            ? "Select up to 5 time slots that work for you." 
            : `${selectedCount} of ${maxSelections} time slots selected${reachedLimit ? " (maximum reached)" : "."}`}
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(slotsByDay).map(([day, slots]) => (
          <DaySlots 
            key={day} 
            day={day} 
            slots={slots} 
            toggleTimeSlot={toggleTimeSlot} 
            findTimeSlotIndex={findTimeSlotIndex} 
            reachedLimit={reachedLimit}
          />
        ))}
      </div>
    </div>
  );
};
