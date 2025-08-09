import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Bug, Wifi, Server, Database, ArrowLeft, ExternalLink } from "lucide-react";

interface EnhancedErrorStateProps {
  error?: Error | string;
  title?: string;
  description?: string;
  variant?: 'default' | 'network' | 'server' | 'data' | 'permission';
  size?: 'sm' | 'md' | 'lg';
  showCard?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onReport?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const getErrorConfig = (variant: EnhancedErrorStateProps['variant'], error?: Error | string) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  switch (variant) {
    case 'network':
      return {
        icon: Wifi,
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        color: 'text-orange-500',
        background: 'bg-orange-50',
        border: 'border-orange-200'
      };
    case 'server':
      return {
        icon: Server,
        title: 'Server Error',
        description: 'Something went wrong on our end. Our team has been notified.',
        color: 'text-red-500',
        background: 'bg-red-50',
        border: 'border-red-200'
      };
    case 'data':
      return {
        icon: Database,
        title: 'Data Error',
        description: 'There was a problem loading the requested data.',
        color: 'text-blue-500',
        background: 'bg-blue-50',
        border: 'border-blue-200'
      };
    case 'permission':
      return {
        icon: AlertTriangle,
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource.',
        color: 'text-yellow-500',
        background: 'bg-yellow-50',
        border: 'border-yellow-200'
      };
    default:
      return {
        icon: AlertTriangle,
        title: 'Something went wrong',
        description: errorMessage || 'An unexpected error occurred. Please try again.',
        color: 'text-red-500',
        background: 'bg-red-50',
        border: 'border-red-200'
      };
  }
};

export const EnhancedErrorState: React.FC<EnhancedErrorStateProps> = ({
  error,
  title,
  description,
  variant = 'default',
  size = 'md',
  showCard = true,
  showDetails = false,
  onRetry,
  onBack,
  onReport,
  retryLabel = 'Try Again',
  isRetrying = false,
  className,
  children
}) => {
  const config = getErrorConfig(variant, error);
  const IconComponent = config.icon;
  
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  
  const sizeConfig = {
    sm: {
      icon: 'h-8 w-8',
      iconContainer: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
      padding: 'p-6'
    },
    md: {
      icon: 'h-10 w-10',
      iconContainer: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
      padding: 'p-8'
    },
    lg: {
      icon: 'h-12 w-12',
      iconContainer: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-lg',
      padding: 'p-10'
    }
  };

  const sizeConf = sizeConfig[size];

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center text-center space-y-6",
      !showCard && sizeConf.padding,
      className
    )}>
      {/* Icon */}
      <div className={cn(
        "rounded-full flex items-center justify-center",
        sizeConf.iconContainer,
        config.background,
        config.border,
        "border"
      )}>
        <IconComponent className={cn(sizeConf.icon, config.color)} />
      </div>

      {/* Content */}
      <div className="space-y-3 max-w-md">
        <h3 className={cn("font-semibold text-foreground", sizeConf.title)}>
          {finalTitle}
        </h3>
        <p className={cn("text-muted-foreground", sizeConf.description)}>
          {finalDescription}
        </p>
      </div>

      {/* Error Details (if requested) */}
      {showDetails && error && (
        <Alert className={cn("max-w-md text-left", config.border, config.background)}>
          <Bug className="h-4 w-4" />
          <AlertDescription className="text-xs font-mono whitespace-pre-wrap">
            {typeof error === 'string' ? error : error.stack || error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
            {isRetrying ? 'Retrying...' : retryLabel}
          </Button>
        )}
        
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        )}
        
        {onReport && (
          <Button
            onClick={onReport}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Report Issue
          </Button>
        )}
      </div>

      {/* Custom children */}
      {children}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className={cn(config.border, config.background)}>
      <div className={sizeConf.padding}>
        {content}
      </div>
    </Card>
  );
};

// Preset error states for common scenarios
export const NetworkError: React.FC<{ onRetry?: () => void; isRetrying?: boolean }> = ({ 
  onRetry, 
  isRetrying 
}) => (
  <EnhancedErrorState
    variant="network"
    onRetry={onRetry}
    isRetrying={isRetrying}
  />
);

export const ServerError: React.FC<{ onRetry?: () => void; onReport?: () => void; isRetrying?: boolean }> = ({ 
  onRetry, 
  onReport, 
  isRetrying 
}) => (
  <EnhancedErrorState
    variant="server"
    onRetry={onRetry}
    onReport={onReport}
    isRetrying={isRetrying}
  />
);

export const DataError: React.FC<{ error?: Error | string; onRetry?: () => void; isRetrying?: boolean }> = ({ 
  error, 
  onRetry, 
  isRetrying 
}) => (
  <EnhancedErrorState
    variant="data"
    error={error}
    onRetry={onRetry}
    isRetrying={isRetrying}
  />
);