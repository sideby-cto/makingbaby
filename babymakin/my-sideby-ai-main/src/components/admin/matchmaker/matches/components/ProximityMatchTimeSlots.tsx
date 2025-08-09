
import { ArrowRight } from "lucide-react";
import { ProximitySlot } from "../../types/matchmaking";
import { formatDate, formatHour } from "../../utils/matchingUtils";

interface ProximityMatchTimeSlotsProps {
  slots: ProximitySlot[];
  timeZone?: string;
}

export const ProximityMatchTimeSlots = ({ slots, timeZone }: ProximityMatchTimeSlotsProps) => {
  return (
    <>
      {slots.map((slot, slotIndex) => (
        <div key={slotIndex} className="text-xs bg-white rounded-md border border-blue-200 p-1.5">
          <div className="font-medium text-gray-700">
            {formatDate(slot.day)}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            <div className="flex items-center">
              <span className="inline-block bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {formatHour(slot.user1Hour)}
              </span>
              <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
              <span className="inline-block bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {formatHour(slot.user2Hour)}
              </span>
              <span className="ml-1 text-gray-500 text-[10px]">
                ({slot.hourDifference}h)
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
