
import { CalendarClock } from "lucide-react";
import { PacingLevel } from "./types";

interface AvailabilitySelectorProps {
  pacingLevel: PacingLevel | null;
  onComplete: () => void;
  initialTimeSlots?: any[];
}

export function AvailabilitySelector({ 
  pacingLevel, 
  onComplete
}: AvailabilitySelectorProps) {
  // Call onComplete immediately since we're not actually showing the selector
  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <CalendarClock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Availability Setting Temporarily Disabled</h3>
        <p className="text-gray-500 mb-4">
          We're improving this feature. Your pacing preferences will be saved without availability for now.
        </p>
        <button 
          onClick={handleComplete}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
