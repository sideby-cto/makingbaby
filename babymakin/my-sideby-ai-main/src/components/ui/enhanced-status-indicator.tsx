import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2, Zap, Database, Cloud, RefreshCw } from "lucide-react";

export interface StatusConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  pulseAnimation?: boolean;
}

const statusConfigs: Record<string, StatusConfig> = {
  // Success states
  complete: {
    label: 'Complete',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Data is complete and up to date'
  },
  success: {
    label: 'Success',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Operation completed successfully'
  },
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Zap,
    description: 'Currently active and operational'
  },
  
  // Warning states
  mapped_no_data: {
    label: 'Missing Data',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertTriangle,
    description: 'Mapping exists but data is missing'
  },
  low_confidence: {
    label: 'Needs Review',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
    description: 'Mapping confidence is low and needs review'
  },
  stale_data: {
    label: 'Stale Data',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Clock,
    description: 'Data exists but may be outdated'
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Operation is pending completion'
  },
  
  // Error states
  no_mapping: {
    label: 'No Mapping',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'No mapping found for this user'
  },
  error: {
    label: 'Error',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'An error occurred'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Operation failed'
  },
  
  // Loading states
  loading: {
    label: 'Loading',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Loader2,
    description: 'Data is being loaded',
    pulseAnimation: true
  },
  syncing: {
    label: 'Syncing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: RefreshCw,
    description: 'Data is being synchronized',
    pulseAnimation: true
  },
  
  // Data source indicators
  local_data: {
    label: 'Local',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Database,
    description: 'Data from local database'
  },
  remote_data: {
    label: 'Remote',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Cloud,
    description: 'Data from remote source'
  }
};

interface EnhancedStatusIndicatorProps {
  status: string;
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
  customLabel?: string;
  customDescription?: string;
  className?: string;
  animate?: boolean;
}

export const EnhancedStatusIndicator: React.FC<EnhancedStatusIndicatorProps> = ({
  status,
  variant = 'default',
  size = 'md',
  showIcon = true,
  showTooltip = true,
  customLabel,
  customDescription,
  className,
  animate = true
}) => {
  const config = statusConfigs[status] || statusConfigs.error;
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: {
      badge: 'text-xs px-2 py-1',
      icon: 'h-3 w-3'
    },
    md: {
      badge: 'text-sm px-2.5 py-1',
      icon: 'h-3.5 w-3.5'
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'h-4 w-4'
    }
  };

  const sizeConfig = sizeClasses[size];
  const label = customLabel || config.label;
  const description = customDescription || config.description;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        sizeConfig.badge,
        config.pulseAnimation && animate && 'animate-pulse',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <IconComponent 
            className={cn(
              sizeConfig.icon,
              status === 'loading' && animate && 'animate-spin',
              status === 'syncing' && animate && 'animate-spin'
            )} 
          />
        )}
        {variant !== 'compact' && (
          <span className="font-medium">{label}</span>
        )}
      </div>
    </Badge>
  );

  if (!showTooltip || variant === 'detailed') {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">{label}</div>
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Preset status indicators for common use cases
export const DataStatusIndicator: React.FC<{
  hasData: boolean;
  isStale?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ hasData, isStale, isLoading, size }) => {
  if (isLoading) {
    return <EnhancedStatusIndicator status="loading" size={size} />;
  }
  
  if (!hasData) {
    return <EnhancedStatusIndicator status="mapped_no_data" size={size} />;
  }
  
  if (isStale) {
    return <EnhancedStatusIndicator status="stale_data" size={size} />;
  }
  
  return <EnhancedStatusIndicator status="complete" size={size} />;
};

export const MappingStatusIndicator: React.FC<{
  exists: boolean;
  confidence?: number;
  needsReview?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ exists, confidence, needsReview, size }) => {
  if (!exists) {
    return <EnhancedStatusIndicator status="no_mapping" size={size} />;
  }
  
  if (needsReview || (confidence && confidence < 0.8)) {
    return <EnhancedStatusIndicator status="low_confidence" size={size} />;
  }
  
  return <EnhancedStatusIndicator status="complete" size={size} />;
};

export const SyncStatusIndicator: React.FC<{
  isSyncing: boolean;
  lastSyncTime?: Date;
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isSyncing, lastSyncTime, hasError, size }) => {
  if (isSyncing) {
    return <EnhancedStatusIndicator status="syncing" size={size} />;
  }
  
  if (hasError) {
    return <EnhancedStatusIndicator status="error" size={size} />;
  }
  
  if (lastSyncTime) {
    const isStale = Date.now() - lastSyncTime.getTime() > 24 * 60 * 60 * 1000; // 24 hours
    return <EnhancedStatusIndicator 
      status={isStale ? "stale_data" : "complete"} 
      size={size} 
    />;
  }
  
  return <EnhancedStatusIndicator status="pending" size={size} />;
};