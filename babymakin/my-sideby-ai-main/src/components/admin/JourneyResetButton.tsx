
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { resetUserJourney } from '@/utils/journeyResetUtils';
import { useToast } from '@/hooks/use-toast';

interface JourneyResetButtonProps {
  userId: string;
  onResetComplete?: () => void;
}

export const JourneyResetButton: React.FC<JourneyResetButtonProps> = ({
  userId,
  onResetComplete
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    try {
      setIsResetting(true);
      
      await resetUserJourney({
        userId,
        reason: 'Admin initiated reset'
      });

      toast({
        title: "Journey Reset",
        description: "User's journey has been reset successfully. They will see an acknowledgment message.",
      });

      onResetComplete?.();
    } catch (error) {
      console.error('Error resetting journey:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset user's journey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button
      onClick={handleReset}
      disabled={isResetting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
      {isResetting ? 'Resetting...' : 'Reset Journey'}
    </Button>
  );
};
