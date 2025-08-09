
import { useUserAvailability } from "./hooks/useUserAvailability";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailedAvailabilityView } from "./availability/DetailedAvailabilityView";
import { CondensedAvailabilityView } from "./availability/CondensedAvailabilityView";
import { AlertCircle, Check, Clock, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface UserAvailabilityProps {
  userId: string;
  detailed?: boolean;
}

export const UserAvailability = ({ userId, detailed = false }: UserAvailabilityProps) => {
  const [forceRefresh, setForceRefresh] = useState(0);
  const { availabilitySlots, loading, error, pacingLevel, refreshAvailability } = useUserAvailability(userId);

  const handleRefresh = () => {
    setForceRefresh(prev => prev + 1);
    refreshAvailability();
  };

  // Transform availability slots to the format used by display components
  const formattedSlots = availabilitySlots.map(slot => {
    // Extract the hour from the startTime (e.g., "2:00 PM" -> 14)
    let hour: number;
    const timeMatch = slot.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (timeMatch) {
      let hourNum = parseInt(timeMatch[1], 10);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hourNum < 12) hourNum += 12;
      if (period === 'AM' && hourNum === 12) hourNum = 0;
      
      hour = hourNum;
    } else {
      // Default to noon if parsing fails
      hour = 12;
    }

    return {
      day: slot.day,
      hour
    };
  });

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (availabilitySlots.length === 0) {
    return (
      <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-md bg-gray-50">
        <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700 mb-1">No availability set</p>
        <p className="text-xs text-gray-400 mt-1 mb-4">This member hasn't set their availability yet</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {availabilitySlots.length} time slot{availabilitySlots.length !== 1 ? 's' : ''} available
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs" 
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      
      {detailed ? (
        <DetailedAvailabilityView 
          availabilitySlots={formattedSlots} 
          pacingLevel={pacingLevel}
        />
      ) : (
        <CondensedAvailabilityView availabilitySlots={formattedSlots} />
      )}
    </div>
  );
};
