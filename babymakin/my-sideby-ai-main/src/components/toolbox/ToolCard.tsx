
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolIcon } from "./icons/ToolIcon";
import { ToolButton, ToolButtonVariant } from "./buttons/ToolButton";
import { ToolCardBadge } from "./badges/ToolBadge";
import { Tool } from "@/types/tools";

// Define all the props the ToolCard can accept
export interface ToolCardProps {
  name?: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  iconBackground?: string;
  iconColor?: string;
  badgeLabel?: string;
  badgeVariant?: "included" | "sponsored" | "custom";
  buttonLabel?: string;
  buttonVariant?: ToolButtonVariant;
  onClick?: () => void;
  className?: string;
  additionalActions?: React.ReactNode;
  additionalContent?: React.ReactNode;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  // Add properties needed for the `tool` prop usage
  tool?: Tool;
  userId?: string | null;
  isUserTool?: boolean;
  userToolId?: string;
  isFavorite?: boolean;
}

export const ToolCard = ({
  name,
  description,
  icon,
  iconBackground = "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800",
  iconColor = "text-gray-600 dark:text-gray-300",
  badgeLabel,
  badgeVariant,
  buttonLabel,
  buttonVariant = "yellow",
  onClick,
  className,
  additionalActions,
  additionalContent,
  onRemove,
  showRemoveButton = false,
  // With tool object, we can derive name, description, etc. if not provided directly
  tool,
  userId,
  isUserTool,
  userToolId,
  isFavorite
}: ToolCardProps) => {
  // If we have a tool object, use its properties as defaults
  const displayName = name || tool?.name || '';
  const displayDescription = description || tool?.description || '';
  const displayButtonLabel = buttonLabel || 'Access Tool';
  
  // Default icon handling
  const defaultIcon = icon || undefined;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (tool?.url) {
      window.open(tool.url, '_blank');
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden bg-card border border-border rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] h-full",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-primary/10 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
      className
    )}>
      {badgeLabel && (
        <ToolCardBadge label={badgeLabel} variant={badgeVariant} />
      )}
      
      <CardContent className="relative p-6 md:p-7 flex flex-col h-full">
        <div className="space-y-5 flex flex-col h-full">
          <ToolIcon 
            icon={defaultIcon} 
            background={iconBackground} 
            color={iconColor}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          
          <div className="space-y-3 flex-grow">
            <h4 className="font-bold text-xl text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {displayName}
            </h4>
            
            {displayDescription && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {displayDescription}
              </p>
            )}
          </div>
          
          <div className="pt-2 space-y-2">
            <ToolButton 
              label={displayButtonLabel}
              variant={buttonVariant}
              onClick={handleClick}
              className="w-full group-hover:shadow-md"
            />
            {additionalActions && (
              <div className="flex gap-2">
                {additionalActions}
              </div>
            )}
          </div>

          {additionalContent && (
            <div className="mt-3 pt-3 border-t border-border">
              {additionalContent}
            </div>
          )}
        </div>
        
        {/* Remove button - positioned absolutely */}
        {showRemoveButton && onRemove && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive flex items-center justify-center transition-colors text-xs opacity-0 group-hover:opacity-100"
            aria-label="Remove tool"
          >
            ×
          </button>
        )}
      </CardContent>
    </Card>
  );
};
