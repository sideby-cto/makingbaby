import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface EnhancedProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercentage?: boolean;
  showStatus?: boolean;
  label?: string;
  description?: string;
  className?: string;
  animated?: boolean;
}

const variantColors = {
  default: {
    background: 'bg-primary/20',
    fill: 'bg-primary',
    text: 'text-primary'
  },
  success: {
    background: 'bg-green-100',
    fill: 'bg-green-500',
    text: 'text-green-700'
  },
  warning: {
    background: 'bg-yellow-100',
    fill: 'bg-yellow-500',
    text: 'text-yellow-700'
  },
  danger: {
    background: 'bg-red-100',
    fill: 'bg-red-500',
    text: 'text-red-700'
  }
};

const sizeConfig = {
  sm: {
    height: 'h-2',
    text: 'text-xs',
    gap: 'gap-2'
  },
  md: {
    height: 'h-3',
    text: 'text-sm',
    gap: 'gap-3'
  },
  lg: {
    height: 'h-4',
    text: 'text-base',
    gap: 'gap-4'
  }
};

export const EnhancedProgress: React.FC<EnhancedProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = true,
  showPercentage = true,
  showStatus = false,
  label,
  description,
  className,
  animated = true
}) => {
  const percentage = Math.round((value / max) * 100);
  const colors = variantColors[variant];
  const config = sizeConfig[size];
  
  const getStatusIcon = () => {
    if (percentage >= 100) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (percentage >= 75) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    } else if (percentage < 25) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      {(showLabel || showPercentage || showStatus) && (
        <div className={cn("flex items-center justify-between", config.gap)}>
          <div className="flex items-center gap-2">
            {showStatus && getStatusIcon()}
            {showLabel && (
              <div>
                {label && (
                  <div className={cn("font-medium", config.text, colors.text)}>
                    {label}
                  </div>
                )}
                {description && (
                  <div className={cn("text-muted-foreground", 
                    size === 'sm' ? 'text-xs' : 'text-sm'
                  )}>
                    {description}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {showPercentage && (
            <div className={cn("font-semibold tabular-nums", config.text, colors.text)}>
              {percentage}%
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <Progress
          value={percentage}
          className={cn(
            config.height,
            colors.background,
            animated && "transition-all duration-500 ease-out"
          )}
        />
        
        {/* Custom fill with animation */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out",
            colors.fill,
            animated && "animate-pulse"
          )}
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            transition: animated ? 'width 500ms ease-out' : undefined
          }}
        />
      </div>
    </div>
  );
};

// Preset progress components for common scenarios
export const DataSyncProgress: React.FC<{
  synced: number;
  total: number;
  isActive?: boolean;
  label?: string;
}> = ({ synced, total, isActive, label }) => (
  <EnhancedProgress
    value={synced}
    max={total}
    variant={synced === total ? 'success' : 'default'}
    label={label || 'Data Sync Progress'}
    description={`${synced} of ${total} items synced`}
    showStatus
    animated={isActive}
  />
);

export const QualityScoreProgress: React.FC<{
  score: number;
  maxScore?: number;
  showThresholds?: boolean;
}> = ({ score, maxScore = 100, showThresholds }) => {
  const getVariant = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  return (
    <EnhancedProgress
      value={score}
      max={maxScore}
      variant={getVariant(score, maxScore)}
      label="Quality Score"
      description={showThresholds ? 
        `Good: 80+, Fair: 60+, Poor: <60` : 
        undefined
      }
      showStatus
    />
  );
};

export const CompletionProgress: React.FC<{
  completed: number;
  total: number;
  taskName?: string;
}> = ({ completed, total, taskName = 'Tasks' }) => (
  <EnhancedProgress
    value={completed}
    max={total}
    variant={completed === total ? 'success' : 'default'}
    label={`${taskName} Completion`}
    description={`${completed} of ${total} completed`}
    showStatus
  />
);