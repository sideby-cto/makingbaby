
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { groupSlotsByDay } from "../utils/availabilityUtils";
import { AvailabilitySlot } from "../types/availability";
import { format } from "date-fns";

interface CondensedAvailabilityViewProps {
  availabilitySlots: AvailabilitySlot[];
}

export const CondensedAvailabilityView = ({ availabilitySlots }: CondensedAvailabilityViewProps) => {
  const slotsByDay = groupSlotsByDay(availabilitySlots);
  
  if (Object.keys(slotsByDay).length === 0) {
    return <div className="text-sm text-gray-500">No availability set</div>;
  }
  
  // Format a time slot (e.g., 13 -> "1:00 PM")
  const formatTimeSlot = (hour: number) => {
    const hourDisplay = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${hourDisplay}:00 ${period}`;
  };
  
  return (
    <Card className="p-3 border border-purple-100 bg-purple-50/50">
      <div className="space-y-2">
        {Object.entries(slotsByDay).map(([day, slots]) => (
          <div key={day} className="text-xs">
            <span className="font-medium">
              {format(new Date(day), "EEE, MMM d")}:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {slots.map((slot) => (
                <Badge
                  key={`${day}-${slot.hour}`}
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 border-purple-200"
                >
                  {formatTimeSlot(slot.hour)}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
