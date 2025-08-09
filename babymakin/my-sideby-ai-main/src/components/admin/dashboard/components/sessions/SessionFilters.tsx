
import React from "react";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface SessionFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  sessionType: string;
  setSessionType: (type: string) => void;
  hasTranscript: boolean;
  setHasTranscript: (value: boolean) => void;
  onReset: () => void;
}

export const SessionFilters = ({ 
  dateRange,
  setDateRange,
  sessionType,
  setSessionType,
  hasTranscript,
  setHasTranscript,
  onReset
}: SessionFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-medium w-[260px] border-2 border-brand-primary/30 hover:border-brand-primary shadow-sm",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-brand-secondary" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-2 border-brand-primary/20 shadow-elegant" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Session Type Filter */}
      <Select value={sessionType} onValueChange={setSessionType}>
        <SelectTrigger className="w-[200px] border-2 border-brand-primary/30 hover:border-brand-primary font-medium shadow-sm">
          <SelectValue placeholder="Session type" />
        </SelectTrigger>
        <SelectContent className="border-2 border-brand-primary/20 shadow-elegant">
          <SelectItem value="all" className="font-medium">All types</SelectItem>
          <SelectItem value="PAIR" className="font-medium">Peer sessions</SelectItem>
          <SelectItem value="SINGLE" className="font-medium">Reflection sessions</SelectItem>
        </SelectContent>
      </Select>

      {/* Has Transcript Filter */}
      <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 border-2 border-brand-primary/20 shadow-sm">
        <Checkbox 
          id="hasTranscript" 
          checked={hasTranscript} 
          onCheckedChange={(checked) => setHasTranscript(checked === true)}
          className="border-2 border-brand-primary/40"
        />
        <label 
          htmlFor="hasTranscript" 
          className="text-sm font-bold text-foreground leading-none cursor-pointer"
        >
          Has transcript
        </label>
      </div>

      {/* Reset Button */}
      <Button 
        variant="secondary" 
        size="sm"
        onClick={onReset}
        className="font-bold shadow-sm"
      >
        Reset filters
      </Button>
    </div>
  );
};
