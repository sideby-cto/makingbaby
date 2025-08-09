
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserJourneyFiltersProps {
  selectedStage: string;
  searchQuery: string;
  dateRange: { from?: Date; to?: Date };
  onStageChange: (stage: string) => void;
  onSearchChange: (query: string) => void;
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
}

const journeyStages = [
  { value: "all", label: "All Stages" },
  { value: "new", label: "New User" },
  { value: "reflection_completed", label: "Reflection Completed" },
  { value: "matched", label: "Matched" },
  { value: "scheduled", label: "Meeting Scheduled" },
  { value: "conversation", label: "In Conversation" },
  { value: "active", label: "Active User" },
  { value: "inactive", label: "Inactive User" }
];

export const UserJourneyFilters: React.FC<UserJourneyFiltersProps> = ({
  selectedStage,
  searchQuery,
  dateRange,
  onStageChange,
  onSearchChange,
  onDateRangeChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <h3 className="text-lg font-semibold">Filters</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Journey Stage</label>
          <Select value={selectedStage} onValueChange={onStageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {journeyStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Registration Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onDateRangeChange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
