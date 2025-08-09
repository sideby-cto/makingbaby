
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const PartialReflectionAlert: React.FC = () => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <p className="font-medium mb-1">Complete your reflection session</p>
        <p>We found a previous incomplete reflection session. Please complete your full reflection (3-5 minutes with thoughtful responses) to help us match you with compatible learning partners.</p>
      </AlertDescription>
    </Alert>
  );
};
