
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { SessionDetailsDisplay } from './SessionDetailsDisplay';

interface ReflectionCompletedAlertProps {
  flowActivity?: string;
  sessionData?: {
    upduo_session_id?: string;
    upduo_session_name?: string;
    participants?: number;
    duration?: string;
    scheduled_time?: string;
  };
}

export const ReflectionCompletedAlert: React.FC<ReflectionCompletedAlertProps> = ({ flowActivity, sessionData }) => {
  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <p className="font-medium mb-1">Great job!</p>
          <p>Your reflection has been recorded. {flowActivity ? "We've identified your teaching style as:" : "We're analyzing your teaching style to find great matches."}</p>
          {flowActivity && (
            <p className="mt-2 font-semibold text-green-700 bg-green-100 inline-block px-3 py-1.5 rounded-full text-sm">{flowActivity}</p>
          )}
        </AlertDescription>
      </Alert>
      <SessionDetailsDisplay sessionData={sessionData} />
    </div>
  );
};
