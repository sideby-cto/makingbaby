import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessNotificationProps {
  show: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
}

export const SuccessNotification = ({
  show,
  onClose,
  title,
  description,
  className
}: SuccessNotificationProps) => {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-sm",
      "bg-success/10 border border-success/20 rounded-lg shadow-elegant",
      "animate-slide-in-right",
      className
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-success">
              {title}
            </p>
            {description && (
              <p className="mt-1 text-xs text-success/80">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4 text-success" />
          </button>
        </div>
      </div>
    </div>
  );
};