
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface ActiveMatchStatusFilterProps {
  showOnlyUnmatched: boolean;
  onToggle: (checked: boolean) => void;
  className?: string;
}

export const ActiveMatchStatusFilter = ({ 
  showOnlyUnmatched, 
  onToggle,
  className = ""
}: ActiveMatchStatusFilterProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch 
        id="unmatched-filter" 
        checked={showOnlyUnmatched} 
        onCheckedChange={onToggle}
      />
      <Label htmlFor="unmatched-filter" className="flex items-center gap-1 text-sm">
        <Users className="h-3 w-3 text-orange-500" />
        <span>Show only unmatched users</span>
      </Label>
      {showOnlyUnmatched && (
        <Badge variant="outline" className="text-xs">
          Active
        </Badge>
      )}
    </div>
  );
};
