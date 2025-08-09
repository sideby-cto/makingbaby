
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const TaskExplanationAlert: React.FC = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <p className="mb-2 font-medium">What is Upduo?</p>
        <p className="mb-2">Upduo is like Zoom or Google Meet, but designed specifically for guided peer learning. Usually, it's where you'll meet to talk AI in Education. First though, take 5-10 minutes to record a brief introduction about your teaching philosophy and interests.</p>
        <p className="text-sm font-medium text-blue-700">Important: Please spend at least 3-5 minutes giving thoughtful responses. Brief sessions may need to be redone for quality matching.</p>
      </AlertDescription>
    </Alert>
  );
};
