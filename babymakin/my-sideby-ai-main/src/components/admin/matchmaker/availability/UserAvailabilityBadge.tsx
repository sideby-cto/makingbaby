
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserAvailability } from "../UserAvailability";
import { supabase } from "@/integrations/supabase/client";
import { CondensedAvailabilityView } from "./CondensedAvailabilityView";
import { AvailabilitySlot } from "../types/availability";

interface UserAvailabilityBadgeProps {
  userId: string;
  compact?: boolean;
}

export const UserAvailabilityBadge = ({ userId, compact = true }: UserAvailabilityBadgeProps) => {
  const [open, setOpen] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [hasRecord, setHasRecord] = useState(false);
  
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        console.log(`[AvailabilityBadge] Starting fetch for user ${userId}`);
        
        const { data, error } = await supabase
          .from('user_availability')
          .select('time_slots')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("[AvailabilityBadge] Error fetching user availability:", error);
          setHasAvailability(false);
          setHasRecord(false);
          return;
        }
        
        // Set hasRecord to true if we got any data back, even if time_slots might be empty
        const recordExists = data !== null;
        setHasRecord(recordExists);
        
        console.log(`[AvailabilityBadge] Raw availability data for user ${userId}:`, data);
        
        if (data?.time_slots && Array.isArray(data.time_slots)) {
          // Log actual structure of first time slot to debug format
          if (data.time_slots.length > 0) {
            console.log("[AvailabilityBadge] First time slot structure:", JSON.stringify(data.time_slots[0], null, 2));
          }
          
          // Process both formats - look for either hour property or start_time
          const slots = data.time_slots.map((slot: any) => {
            let day = slot.day;
            let hour: number;
            
            // Check if hour property exists directly
            if (typeof slot.hour === 'number') {
              hour = slot.hour;
            } 
            // If not, try to extract from start_time or startTime
            else if (slot.start_time || slot.startTime) {
              const timeStr = slot.start_time || slot.startTime;
              const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
              
              if (timeMatch) {
                let hourNum = parseInt(timeMatch[1], 10);
                const period = timeMatch[3].toUpperCase();
                
                // Convert to 24-hour format
                if (period === 'PM' && hourNum < 12) hourNum += 12;
                if (period === 'AM' && hourNum === 12) hourNum = 0;
                
                hour = hourNum;
              } else {
                console.log(`[AvailabilityBadge] Could not parse time from: ${timeStr}`);
                hour = 0; // Default
              }
            } else {
              console.log(`[AvailabilityBadge] No hour or start_time in slot:`, slot);
              hour = 0; // Default
            }
            
            return { day, hour };
          });
          
          console.log(`[AvailabilityBadge] Processed slots for user ${userId}:`, slots);
          setAvailabilitySlots(slots);
          setHasAvailability(slots.length > 0);
        } else {
          console.log(`[AvailabilityBadge] No valid time slots for user ${userId}`);
          setAvailabilitySlots([]);
          setHasAvailability(false);
        }
      } catch (err) {
        console.error("[AvailabilityBadge] Unexpected error fetching availability:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [userId]);
  
  if (loading) {
    return (
      <Badge variant="outline" className="bg-slate-50 opacity-50">
        <Calendar className="h-3 w-3" />
      </Badge>
    );
  }
  
  // Always show the badge, but style it differently based on availability status
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge 
          variant="outline" 
          className={`cursor-pointer ${hasAvailability 
            ? "bg-slate-50 hover:bg-slate-100" 
            : "bg-gray-100 text-gray-400 hover:bg-gray-200"} transition-colors`}
          title={hasRecord 
            ? (hasAvailability ? "Has availability" : "No time slots set") 
            : "No availability record"}
        >
          <Calendar className="h-3 w-3" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Available Times</h4>
          {hasAvailability ? (
            <CondensedAvailabilityView availabilitySlots={availabilitySlots} />
          ) : (
            <p className="text-sm text-gray-500">
              {hasRecord ? "No availability slots set" : "No availability record found"}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
