
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusFiltersProps {
  value: string;
  onChange: (value: string) => void;
  counts: {
    scheduled: number;
    sent: number;
    pending: number;
    failed: number;
  };
}

export const StatusFilters: React.FC<StatusFiltersProps> = ({ value, onChange, counts }) => {
  return (
    <div className="w-full sm:w-[180px]">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="scheduled">Scheduled ({counts.scheduled})</SelectItem>
          <SelectItem value="sent">Sent ({counts.sent})</SelectItem>
          <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
          <SelectItem value="failed">Failed ({counts.failed})</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
