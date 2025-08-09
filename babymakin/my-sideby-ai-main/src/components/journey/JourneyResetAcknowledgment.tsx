
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, RefreshCw } from 'lucide-react';

interface JourneyResetAcknowledgmentProps {
  onAcknowledge: () => void;
  resetDate: string;
}

export const JourneyResetAcknowledgment: React.FC<JourneyResetAcknowledgmentProps> = ({
  onAcknowledge,
  resetDate
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Daycount Reset
          </h2>
          <p className="text-gray-600">
            Your journey counter has been reset to acknowledge a new season for sideby.
          </p>
        </div>

        <Alert className="mb-6">
          <Calendar className="h-4 w-4" />
          <AlertTitle>New Beginning</AlertTitle>
          <AlertDescription>
            You can expect a bit more from us moving forward!
          </AlertDescription>
        </Alert>

        <div className="text-sm text-gray-500 mb-6">
          <p>This reset gives you a clean slate to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Track your progress from this milestone</li>
            <li>Build new habits and routines</li>
            <li>Focus on your current goals</li>
          </ul>
        </div>

        <Button 
          onClick={onAcknowledge}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Got it, let's start!
        </Button>
      </div>
    </div>
  );
};
