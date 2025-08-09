import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  description?: string;
}

const FilterToggle: React.FC<FilterToggleProps> = ({
  id,
  label,
  checked,
  onCheckedChange,
  icon: Icon,
  count,
  description
}) => {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer group",
        checked 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-border bg-card hover:border-primary/30 hover:bg-primary/2"
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          "p-2 rounded-md transition-colors",
          checked 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Label 
              htmlFor={id} 
              className={cn(
                "text-sm font-medium cursor-pointer transition-colors",
                checked ? "text-primary" : "text-foreground"
              )}
            >
              {label}
            </Label>
            {count !== undefined && (
              <Badge 
                variant={checked ? "default" : "secondary"} 
                className="h-5 text-xs"
              >
                {count}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      
      <Switch 
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="pointer-events-none"
      />
    </div>
  );
};

interface ImprovedFilterTogglesProps {
  showOnlyUnmatched: boolean;
  onUnmatchedToggle: (checked: boolean) => void;
  showOnlyReflectionCompleted: boolean;
  onReflectionToggle: (checked: boolean) => void;
  showAdminUsers: boolean;
  onAdminUsersToggle: (checked: boolean) => void;
  unmatchedCount?: number;
  reflectionCount?: number;
  adminCount?: number;
}

export const ImprovedFilterToggles: React.FC<ImprovedFilterTogglesProps> = ({
  showOnlyUnmatched,
  onUnmatchedToggle,
  showOnlyReflectionCompleted,
  onReflectionToggle,
  showAdminUsers,
  onAdminUsersToggle,
  unmatchedCount,
  reflectionCount,
  adminCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <FilterToggle
        id="unmatched-filter"
        label="Unmatched Users Only"
        description="Show only users without active matches"
        checked={showOnlyUnmatched}
        onCheckedChange={onUnmatchedToggle}
        icon={UserX}
        count={unmatchedCount}
      />
      
      <FilterToggle
        id="reflection-filter"
        label="Completed Reflection"
        description="Show only users who completed onboarding reflection"
        checked={showOnlyReflectionCompleted}
        onCheckedChange={onReflectionToggle}
        icon={CheckCircle}
        count={reflectionCount}
      />
      
      <FilterToggle
        id="admin-filter"
        label="Include Admin Users"
        description="Include users with administrative privileges"
        checked={showAdminUsers}
        onCheckedChange={onAdminUsersToggle}
        icon={Shield}
        count={adminCount}
      />
    </div>
  );
};