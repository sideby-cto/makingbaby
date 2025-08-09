
import React from "react";
import { Button } from "@/components/ui/button";
import { Star, Flame, Zap, Loader2 } from "lucide-react";

interface OptimisticExcitementRatingProps {
  excitementLevel: number;
  onRatingChange: (e: React.MouseEvent, level: number) => void;
  isCompact?: boolean;
  readOnly?: boolean;
  isSaving?: boolean;
  pendingLevel?: number;
  saveError?: string | null;
}

const excitementLabels = [
  { 
    level: 1, 
    label: "Mild Interest", 
    shortLabel: "Mild", 
    icon: Star,
    selectedClass: "bg-sideby-yellow-500 hover:bg-sideby-yellow-600 text-white border-sideby-yellow-500 shadow-lg font-bold", 
    unselectedClass: "bg-white hover:bg-sideby-yellow-50 text-sideby-text-primary border-gray-300 hover:border-sideby-yellow-400 font-semibold",
    pendingClass: "bg-sideby-yellow-300 text-white border-sideby-yellow-400 font-bold animate-pulse",
    readOnlySelectedClass: "bg-sideby-yellow-200 text-sideby-yellow-800 border-sideby-yellow-300 font-bold cursor-default",
    readOnlyUnselectedClass: "bg-gray-100 text-gray-500 border-gray-200 cursor-default font-semibold"
  },
  { 
    level: 2, 
    label: "Exciting", 
    shortLabel: "Exciting", 
    icon: Flame,
    selectedClass: "bg-sideby-orange-500 hover:bg-sideby-orange-600 text-white border-sideby-orange-500 shadow-lg font-bold", 
    unselectedClass: "bg-white hover:bg-sideby-orange-50 text-sideby-text-primary border-gray-300 hover:border-sideby-orange-400 font-semibold",
    pendingClass: "bg-sideby-orange-300 text-white border-sideby-orange-400 font-bold animate-pulse",
    readOnlySelectedClass: "bg-sideby-orange-200 text-sideby-orange-800 border-sideby-orange-300 font-bold cursor-default",
    readOnlyUnselectedClass: "bg-gray-100 text-gray-500 border-gray-200 cursor-default font-semibold"
  },
  { 
    level: 3, 
    label: "Game Changer", 
    shortLabel: "Game", 
    icon: Zap,
    selectedClass: "bg-sideby-burgundy-500 hover:bg-sideby-burgundy-600 text-white border-sideby-burgundy-500 shadow-lg font-bold", 
    unselectedClass: "bg-white hover:bg-sideby-burgundy-50 text-sideby-text-primary border-gray-300 hover:border-sideby-burgundy-400 font-semibold",
    pendingClass: "bg-sideby-burgundy-300 text-white border-sideby-burgundy-400 font-bold animate-pulse",
    readOnlySelectedClass: "bg-sideby-burgundy-200 text-sideby-burgundy-800 border-sideby-burgundy-300 font-bold cursor-default",
    readOnlyUnselectedClass: "bg-gray-100 text-gray-500 border-gray-200 cursor-default font-semibold"
  }
];

export const OptimisticExcitementRating = ({ 
  excitementLevel, 
  onRatingChange,
  isCompact = true,
  readOnly = false,
  isSaving = false,
  pendingLevel,
  saveError
}: OptimisticExcitementRatingProps) => {
  return (
    <div className="flex flex-col gap-3">
      {!isCompact && (
        <p className="text-sm font-bold text-sideby-text-primary tracking-wide">Excitement Level</p>
      )}
      <div className="flex gap-3">
        {excitementLabels.map(({ level, label, shortLabel, icon: Icon, selectedClass, unselectedClass, pendingClass, readOnlySelectedClass, readOnlyUnselectedClass }) => {
          const isSelected = excitementLevel === level;
          const isPending = pendingLevel === level && isSaving;
          
          let buttonClass;
          if (readOnly) {
            buttonClass = isSelected ? readOnlySelectedClass : readOnlyUnselectedClass;
          } else if (isPending) {
            buttonClass = pendingClass;
          } else {
            buttonClass = isSelected ? selectedClass : unselectedClass;
          }

          return (
            <Button
              key={level}
              variant="ghost"
              size="sm"
              disabled={readOnly || isSaving}
              className={`px-4 py-3 text-xs rounded-xl border-2 ${readOnly || isSaving ? '' : 'transition-all duration-200 hover:scale-[1.05] hover:shadow-md'} shadow-sm flex-1 h-12 ${buttonClass}`}
              title={readOnly ? `${label} (Click "View" to change rating)` : label}
              onClick={readOnly ? undefined : (e) => onRatingChange(e, level)}
            >
              <div className="flex items-center gap-2">
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                <span className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold">
                  {isCompact ? shortLabel : label}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
