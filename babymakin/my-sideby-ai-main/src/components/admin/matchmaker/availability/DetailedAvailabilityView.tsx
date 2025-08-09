
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { groupSlotsByDay } from "../utils/availabilityUtils";
import { AvailabilitySlot } from "../types/availability";
import { format } from "date-fns";
import { CalendarClock, Clock } from "lucide-react";
import { databaseToPacingLevel } from "@/components/dashboard/pacing/types";

interface DetailedAvailabilityViewProps {
  availabilitySlots: AvailabilitySlot[];
  pacingLevel: string;
}

export const DetailedAvailabilityView = ({ 
  availabilitySlots,
  pacingLevel
}: DetailedAvailabilityViewProps) => {
  const slotsByDay = groupSlotsByDay(availabilitySlots);
  
  // Format a time slot (e.g., 13 -> "1:00 PM")
  const formatTimeSlot = (hour: number) => {
    const hourDisplay = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${hourDisplay}:00 ${period}`;
  };

  // Format the pacing level for display (convert from database format if needed)
  const formatPacingLevel = (level: string): string => {
    if (!level) return 'Not set';
    
    try {
      // Try to convert using the helper function
      const pacingLevel = databaseToPacingLevel(level);
      
      // Format with capitalization and replace underscores with spaces
      return pacingLevel
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (e) {
      // If conversion fails, just format the raw string
      return level
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 bg-purple-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-purple-600" />
          Member Availability
        </CardTitle>
        {pacingLevel && (
          <div className="text-xs text-gray-600">
            Pacing level: <span className="font-medium">{formatPacingLevel(pacingLevel)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {Object.keys(slotsByDay).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No availability time slots have been set
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">
              This member has set {availabilitySlots.length} time slots across {Object.keys(slotsByDay).length} days
            </div>
            {Object.entries(slotsByDay).map(([day, slots]) => (
              <div key={day} className="border rounded-lg p-3 bg-gray-50">
                <div className="font-medium mb-2">
                  {format(new Date(day), "EEEE, MMMM d, yyyy")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <Badge
                      key={`${day}-${slot.hour}`}
                      variant="outline"
                      className="bg-white flex items-center gap-1 py-1 px-2"
                    >
                      <Clock className="w-3 h-3 text-purple-600" />
                      {formatTimeSlot(slot.hour)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
