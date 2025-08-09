import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingButtonProps {
  isThinking?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  children?: React.ReactNode;
  thinkingText?: string;
}

export const ThinkingButton = ({
  isThinking = false,
  onClick,
  disabled,
  className,
  size = 'default',
  variant = 'default',
  children,
  thinkingText = 'Send',
  ...props
}: ThinkingButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isThinking}
      className={cn(
        'relative overflow-hidden',
        isThinking && 'cursor-not-allowed',
        className
      )}
      size={size}
      variant={variant}
      {...props}
    >
      {isThinking ? (
        <div className="relative flex items-center gap-2">
          {size === 'icon' ? (
            <Send className="h-4 w-4" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="relative">
                {thinkingText}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    style={{
                      animation: 'thinking-stripe 1.5s ease-in-out infinite',
                      transform: 'translateX(-100%)'
                    }}
                  />
                </div>
              </span>
            </>
          )}
        </div>
      ) : (
        children || (
          <>
            <Send className="h-4 w-4" />
            {size !== 'icon' && <span className="ml-1">Send</span>}
          </>
        )
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes thinking-stripe {
            0% {
              transform: translateX(-100%) skewX(-12deg);
            }
            100% {
              transform: translateX(200%) skewX(-12deg);
            }
          }
        `
      }} />
    </Button>
  );
};