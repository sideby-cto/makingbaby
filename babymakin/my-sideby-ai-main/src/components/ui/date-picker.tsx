
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { getUserTimeZone } from "@/components/admin/matchmaker/utils/timeZoneUtils"

export interface DatePickerProps {
  date?: Date
  onDateChange?: (date?: Date) => void
  className?: string
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [timeInput, setTimeInput] = React.useState<string>(() => {
    if (date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return "12:00"; // Default to noon
  });
  const [timeZone, setTimeZone] = React.useState<string>(getUserTimeZone());

  // Update the full date when either the date or time changes
  React.useEffect(() => {
    if (selectedDate) {
      try {
        const [hours, minutes] = timeInput.split(':').map(Number);
        
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          const newDate = new Date(selectedDate);
          newDate.setHours(hours, minutes);
          
          if (onDateChange) {
            onDateChange(newDate);
          }
        }
      } catch (error) {
        console.error("Error parsing time input:", error);
      }
    }
  }, [selectedDate, timeInput, onDateChange]);
  
  // Update internal state when date prop changes
  React.useEffect(() => {
    if (date !== undefined) {
      setSelectedDate(date);
      
      if (date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setTimeInput(`${hours}:${minutes}`);
      }
    }
  }, [date]);

  const handleSelect = (date?: Date) => {
    setSelectedDate(date);
  };
  
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
  };

  // Format date for display with time zone
  const formatDateWithTimeZone = (date?: Date): string => {
    if (!date) return "Pick a date";
    
    try {
      const formattedDate = format(date, "PPP");
      return formattedDate;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Validate time input and format it properly
  const formatTimeInput = (input: string): string => {
    // Implement time validation logic here
    return input;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? formatDateWithTimeZone(selectedDate) : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      <div className="flex items-center">
        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
        <div className="relative w-full">
          <Input
            type="time"
            value={timeInput}
            onChange={handleTimeInputChange}
            className="w-full"
            aria-label="Time"
            step="60"
          />
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        Time zone: {timeZone}
      </div>
    </div>
  )
}
