
import { ArrowRight } from "lucide-react";
import { OverlappingSlot } from "../../types/matchmaking";
import { formatDate, formatHour } from "../../utils/matchingUtils";

interface ExactMatchTimeSlotsProps {
  slots: OverlappingSlot[];
  timeZone?: string;
}

export const ExactMatchTimeSlots = ({ slots, timeZone }: ExactMatchTimeSlotsProps) => {
  return (
    <>
      {slots.map((slot, slotIndex) => (
        <div key={slotIndex} className="text-xs bg-white rounded-md border border-purple-200 p-1.5">
          <div className="font-medium text-gray-700">
            {formatDate(slot.day)}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {slot.hours && slot.hours.map(hour => (
              <span key={hour} className="inline-block bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                {formatHour(hour)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};
