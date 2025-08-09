
import React from "react";
import { Button } from "@/components/ui/button";
import { Star, Flame, Zap, Target, CheckCircle, Award, Loader2 } from "lucide-react";

interface CompactRatingButtonsProps {
  type: 'excitement' | 'alignment';
  currentLevel: number;
  onRatingChange: (e: React.MouseEvent, level: number) => void;
  isUpdating?: boolean;
  pendingLevel?: number;
}

const excitementConfig = [
  { level: 1, icon: Star, color: "sideby-yellow" },
  { level: 2, icon: Flame, color: "sideby-orange" },
  { level: 3, icon: Zap, color: "sideby-burgundy" }
];

const alignmentConfig = [
  { level: 1, icon: Target, color: "sideby-blue" },
  { level: 2, icon: CheckCircle, color: "sideby-teal" },
  { level: 3, icon: Award, color: "sideby-burgundy" }
];

export const CompactRatingButtons = ({
  type,
  currentLevel,
  onRatingChange,
  isUpdating = false,
  pendingLevel
}: CompactRatingButtonsProps) => {
  const config = type === 'excitement' ? excitementConfig : alignmentConfig;

  return (
    <div className="flex gap-1">
      {config.map(({ level, icon: Icon, color }) => {
        const isSelected = currentLevel === level;
        const isPending = pendingLevel === level && isUpdating;
        
        return (
          <Button
            key={level}
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            className={`p-1 h-6 w-6 rounded-md border transition-all duration-200 ${
              isSelected 
                ? `bg-${color}-500 text-white border-${color}-500 shadow-sm` 
                : `bg-white text-gray-500 border-gray-300 hover:bg-${color}-50 hover:text-${color}-600 hover:border-${color}-400`
            } ${isPending ? 'animate-pulse' : ''}`}
            onClick={(e) => onRatingChange(e, level)}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Icon className="h-3 w-3" />
            )}
          </Button>
        );
      })}
    </div>
  );
};
