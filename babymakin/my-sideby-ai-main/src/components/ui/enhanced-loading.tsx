import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Database, Cloud, Search, RefreshCw } from "lucide-react";

interface EnhancedLoadingProps {
  variant?: 'default' | 'data' | 'search' | 'sync' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  submessage?: string;
  showIcon?: boolean;
  className?: string;
}

const LoadingIcon = ({ variant }: { variant: EnhancedLoadingProps['variant'] }) => {
  switch (variant) {
    case 'data':
      return <Database className="h-4 w-4 animate-pulse" />;
    case 'search':
      return <Search className="h-4 w-4 animate-pulse" />;
    case 'sync':
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    default:
      return <Loader2 className="h-4 w-4 animate-spin" />;
  }
};

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  variant = 'default',
  size = 'md',
  message = 'Loading...',
  submessage,
  showIcon = true,
  className
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showIcon && <LoadingIcon variant={variant} />}
        <span className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      <div className="flex flex-col items-center gap-3">
        {showIcon && (
          <div className="relative">
            <LoadingIcon variant={variant} />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-50 animate-pulse" />
          </div>
        )}
        
        <div className="text-center space-y-1">
          <div className={cn(
            "font-medium text-foreground animate-fade-in",
            textSizeClasses[size]
          )}>
            {message}
          </div>
          
          {submessage && (
            <div className={cn(
              "text-muted-foreground animate-fade-in",
              size === 'sm' ? 'text-xs' : 'text-xs'
            )}>
              {submessage}
            </div>
          )}
        </div>

        {/* Animated loading dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-primary rounded-full animate-pulse"
              style={{ 
                animationDelay: `${i * 200}ms`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton components for different content types
export const DataSkeleton: React.FC<{ rows?: number; showAvatar?: boolean }> = ({ 
  rows = 3, 
  showAvatar = false 
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        {showAvatar && (
          <div className="w-8 h-8 bg-muted rounded-full" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ showHeader?: boolean }> = ({ 
  showHeader = true 
}) => (
  <div className="border rounded-lg p-4 space-y-4 animate-pulse">
    {showHeader && (
      <div className="flex items-center justify-between">
        <div className="h-5 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
    )}
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  </div>
);