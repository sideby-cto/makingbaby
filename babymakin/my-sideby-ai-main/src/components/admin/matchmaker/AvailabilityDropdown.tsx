
import { useState, useEffect } from "react";
import { UserAvailability } from "./UserAvailability";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUserAvailability } from "./hooks/useUserAvailability";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvailabilityDropdownProps {
  userId: string;
  className?: string;
}

export const AvailabilityDropdown = ({ userId, className = "" }: AvailabilityDropdownProps) => {
  const [showAvailability, setShowAvailability] = useState<string>("condensed");
  const { availabilitySlots, loading, error, refreshAvailability } = useUserAvailability(userId);
  
  const hasAvailability = !loading && !error && availabilitySlots.length > 0;
  
  useEffect(() => {
    // If no availability is found, automatically set to hidden view to avoid empty UI
    if (!loading && availabilitySlots.length === 0) {
      setShowAvailability("hidden");
    } else if (!loading && availabilitySlots.length > 0 && showAvailability === "hidden") {
      // If availability data is loaded and we were hiding it, show the condensed view
      setShowAvailability("condensed");
    }
  }, [loading, availabilitySlots, showAvailability]);
  
  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <Badge 
          variant="outline" 
          className={`px-2 py-1 ${hasAvailability ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}
        >
          <Clock className={`h-3 w-3 mr-1 ${hasAvailability ? 'text-purple-600' : 'text-gray-400'}`} />
          <span className={`text-xs ${hasAvailability ? 'text-purple-700' : 'text-gray-500'}`}>
            Member Availability
          </span>
        </Badge>
        {hasAvailability && (
          <Badge variant="outline" className="px-2 py-1 bg-green-50 border-green-200">
            <span className="text-xs text-green-700">
              {availabilitySlots.length} slot{availabilitySlots.length !== 1 ? 's' : ''}
            </span>
          </Badge>
        )}
      </div>
      
      <Card className={`border ${hasAvailability ? 'border-purple-100' : 'border-gray-100'}`}>
        <CardContent className="p-4">
          <Select
            value={showAvailability}
            onValueChange={setShowAvailability}
          >
            <SelectTrigger className="w-full bg-white border border-gray-200 text-sm mb-4 focus:ring-purple-500">
              <div className="flex items-center gap-2">
                <Calendar className={`h-4 w-4 ${hasAvailability ? 'text-purple-600' : 'text-gray-400'}`} />
                <SelectValue placeholder="View availability" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hidden">Hide availability details</SelectItem>
              <SelectItem value="condensed">View condensed format</SelectItem>
              <SelectItem value="detailed">View detailed schedule</SelectItem>
            </SelectContent>
          </Select>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load availability data: {error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="py-4 text-center text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading availability...</p>
            </div>
          )}

          {!loading && showAvailability !== "hidden" && !error && (
            <div className={`${showAvailability === "detailed" ? "bg-white rounded-md" : ""}`}>
              <UserAvailability 
                userId={userId} 
                detailed={showAvailability === "detailed"} 
              />
            </div>
          )}

          {!loading && !error && availabilitySlots.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              <Clock className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium mb-1">No availability set</p>
              <p className="text-xs text-gray-400 mb-3">This member hasn't set their availability yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
