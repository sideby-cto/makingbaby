
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';
import { ExactMatchTimeSlots } from './ExactMatchTimeSlots';
import { ProximityMatchTimeSlots } from './ProximityMatchTimeSlots';
import { OverlappingSlot, ProximitySlot } from '../../types/matchmaking';

interface TimeSlotDisplayProps {
  overlappingSlots?: OverlappingSlot[];
  proximitySlots?: ProximitySlot[];
  timeZone?: string;
}

export const TimeSlotDisplay = ({ overlappingSlots, proximitySlots, timeZone }: TimeSlotDisplayProps) => {
  const hasOverlapping = overlappingSlots && overlappingSlots.length > 0;
  const hasProximity = proximitySlots && proximitySlots.length > 0;
  
  if (!hasOverlapping && !hasProximity) return null;
  
  return (
    <Card className="mt-2">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarClock className="h-4 w-4" />
          <span>Available Time Slots</span>
        </div>
        
        {hasOverlapping && (
          <ExactMatchTimeSlots slots={overlappingSlots!} timeZone={timeZone || 'UTC'} />
        )}
        
        {hasProximity && (
          <ProximityMatchTimeSlots slots={proximitySlots!} timeZone={timeZone || 'UTC'} />
        )}
      </CardContent>
    </Card>
  );
};
