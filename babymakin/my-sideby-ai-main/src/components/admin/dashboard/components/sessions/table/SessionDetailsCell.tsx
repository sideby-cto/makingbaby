
import React from "react";
import { format } from "date-fns";

interface SessionDetailsCellProps {
  title: string;
  createdAt: number;
}

export const SessionDetailsCell = ({ title, createdAt }: SessionDetailsCellProps) => {
  const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');
  
  return (
    <div>
      <div className="font-medium line-clamp-1">
        {title || "Unnamed session"}
      </div>
      <div className="text-sm text-muted-foreground">
        {formattedDate}
      </div>
    </div>
  );
};
