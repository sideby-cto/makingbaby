
export interface AvailabilitySlot {
  day: string;
  hour: number;
}

export interface UserAvailabilityProps {
  userId: string;
  detailed?: boolean;
}

export interface AvailabilityData {
  availabilitySlots: AvailabilitySlot[];
  pacingLevel: string;
}

export interface SlotsByDay {
  [day: string]: AvailabilitySlot[];
}
