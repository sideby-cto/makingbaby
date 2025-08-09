
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";

interface CompletionDateAlertProps {
  date: string;
  pacingLabel: string;
  days: number;
}

export const CompletionDateAlert: React.FC<CompletionDateAlertProps> = ({ date, pacingLabel, days }) => {
  return (
    <Alert className="bg-indigo-50 border-indigo-200">
      <Calendar className="h-4 w-4 text-indigo-600" />
      <AlertDescription className="text-indigo-800">
        <p className="font-medium mb-1">Suggested timeline:</p>
        <p>Complete your sideby reflection by <span className="font-semibold">{date}</span> ({days} days) to stay {pacingLabel.toLowerCase()}.</p>
      </AlertDescription>
    </Alert>
  );
};
