import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedScheduleButtonProps {
  onSchedule: () => void;
  isScheduling: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AnimatedScheduleButton = ({
  onSchedule,
  isScheduling,
  className,
  children
}: AnimatedScheduleButtonProps) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async () => {
    await onSchedule();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isScheduling}
      className={cn(
        "flex-1 h-9 relative overflow-hidden transition-all duration-300",
        "bg-gradient-to-r from-brand-primary to-brand-secondary",
        "hover:from-brand-primary/90 hover:to-brand-secondary/90",
        "shadow-lg hover:shadow-xl",
        isSuccess && "bg-green-500 hover:bg-green-600",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-full">
        {/* Loading shimmer effect */}
        {isScheduling && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[slide_1.5s_ease-in-out_infinite]" />
        )}
        
        {/* Success burst effect */}
        {isSuccess && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white animate-ping absolute" />
              <Sparkles className="h-3 w-3 text-white/80 animate-ping absolute delay-75" />
              <Sparkles className="h-2 w-2 text-white/60 animate-ping absolute delay-150" />
            </div>
          </>
        )}
        
        {/* Button content with smooth transitions */}
        <div className={cn(
          "flex items-center gap-2 transition-all duration-300",
          isScheduling && "animate-pulse",
          isSuccess && "animate-bounce"
        )}>
          {isSuccess ? (
            <>
              <Check className="h-4 w-4" />
              <span>Scheduled!</span>
            </>
          ) : isScheduling ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              <span>Scheduling...</span>
            </>
          ) : (
            children || (
              <>
                <Calendar className="h-4 w-4" />
                <span>Schedule Next Session</span>
              </>
            )
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slide {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
        `
      }} />
    </Button>
  );
};