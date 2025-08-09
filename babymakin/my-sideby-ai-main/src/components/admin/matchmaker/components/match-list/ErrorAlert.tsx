
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ApiError {
  message: string;
}

interface ErrorAlertProps {
  error: Error | ApiError | null;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Loading Matches</AlertTitle>
      <AlertDescription>
        {error instanceof Error ? error.message : "There was a problem loading the matches. Please try again."}
      </AlertDescription>
    </Alert>
  );
};
