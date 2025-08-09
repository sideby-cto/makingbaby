
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePeriod } from "@/utils/timePeriodsGenerator";

interface TimePeriodsSelectProps {
  value: TimePeriod;
  onValueChange: (value: TimePeriod) => void;
  timePeriodsData: Record<TimePeriod, any>;
}

export const TimePeriodsSelect: React.FC<TimePeriodsSelectProps> = ({
  value,
  onValueChange,
  timePeriodsData
}) => {
  return (
    <Select value={value} onValueChange={(val) => onValueChange(val as TimePeriod)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time period" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(timePeriodsData).map((period) => (
          <SelectItem key={period} value={period}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
