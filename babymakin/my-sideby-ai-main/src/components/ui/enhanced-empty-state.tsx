import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Database, Users, FileText, Settings, AlertCircle, Search, Plus, RefreshCw } from "lucide-react";

interface EnhancedEmptyStateProps {
  variant?: 'default' | 'data' | 'search' | 'error' | 'success';
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    icon?: LucideIcon;
  };
  size?: 'sm' | 'md' | 'lg';
  showCard?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const getDefaultIcon = (variant: EnhancedEmptyStateProps['variant']) => {
  switch (variant) {
    case 'data':
      return Database;
    case 'search':
      return Search;
    case 'error':
      return AlertCircle;
    case 'success':
      return Plus;
    default:
      return FileText;
  }
};

const getVariantColors = (variant: EnhancedEmptyStateProps['variant']) => {
  switch (variant) {
    case 'data':
      return {
        icon: 'text-blue-500',
        background: 'bg-blue-50',
        border: 'border-blue-100'
      };
    case 'search':
      return {
        icon: 'text-purple-500',
        background: 'bg-purple-50',
        border: 'border-purple-100'
      };
    case 'error':
      return {
        icon: 'text-red-500',
        background: 'bg-red-50',
        border: 'border-red-100'
      };
    case 'success':
      return {
        icon: 'text-green-500',
        background: 'bg-green-50',
        border: 'border-green-100'
      };
    default:
      return {
        icon: 'text-gray-500',
        background: 'bg-gray-50',
        border: 'border-gray-100'
      };
  }
};

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  variant = 'default',
  icon: IconComponent,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  showCard = true,
  className,
  children
}) => {
  const FinalIcon = IconComponent || getDefaultIcon(variant);
  const colors = getVariantColors(variant);
  
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

  const config = sizeConfig[size];

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center text-center space-y-4",
      !showCard && config.padding,
      className
    )}>
      {/* Icon */}
      <div className={cn(
        "rounded-full flex items-center justify-center",
        config.iconContainer,
        colors.background,
        colors.border,
        "border"
      )}>
        <FinalIcon className={cn(config.icon, colors.icon)} />
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-md">
        <h3 className={cn("font-semibold text-foreground", config.title)}>
          {title}
        </h3>
        {description && (
          <p className={cn("text-muted-foreground", config.description)}>
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="flex items-center gap-2"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              className="flex items-center gap-2"
            >
              {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Custom children */}
      {children && (
        <div className="pt-2">
          {children}
        </div>
      )}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className={cn("border-dashed", colors.border, colors.background)}>
      <div className={config.padding}>
        {content}
      </div>
    </Card>
  );
};

// Preset empty states for common scenarios
export const NoDataEmptyState: React.FC<{ onRefresh?: () => void; refreshing?: boolean }> = ({ 
  onRefresh, 
  refreshing = false 
}) => (
  <EnhancedEmptyState
    variant="data"
    icon={Database}
    title="No Data Available"
    description="There's no data to display at the moment. Try refreshing or check back later."
    action={onRefresh ? {
      label: refreshing ? 'Refreshing...' : 'Refresh Data',
      onClick: onRefresh,
      icon: RefreshCw
    } : undefined}
  />
);

export const NoUsersEmptyState: React.FC<{ onAddUser?: () => void }> = ({ onAddUser }) => (
  <EnhancedEmptyState
    variant="default"
    icon={Users}
    title="No Users Found"
    description="Get started by adding your first user or adjusting your search criteria."
    action={onAddUser ? {
      label: 'Add User',
      onClick: onAddUser,
      icon: Plus
    } : undefined}
  />
);

export const SearchEmptyState: React.FC<{ searchTerm?: string; onClearSearch?: () => void }> = ({ 
  searchTerm, 
  onClearSearch 
}) => (
  <EnhancedEmptyState
    variant="search"
    icon={Search}
    title="No Results Found"
    description={searchTerm ? 
      `No results found for "${searchTerm}". Try adjusting your search terms.` : 
      "No results match your current search criteria."
    }
    action={onClearSearch ? {
      label: 'Clear Search',
      onClick: onClearSearch,
      variant: 'outline'
    } : undefined}
  />
);