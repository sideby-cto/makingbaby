
import React from "react";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle, Award, Loader2 } from "lucide-react";

interface OptimisticAlignmentRatingProps {
  alignmentLevel: number;
  onRatingChange: (e: React.MouseEvent, level: number) => void;
  isCompact?: boolean;
  readOnly?: boolean;
  isSaving?: boolean;
  pendingLevel?: number;
  saveError?: string | null;
}

const alignmentLabels = [
  { 
    level: 1, 
    label: "Somewhat Aligned", 
    shortLabel: "Some", 
    icon: Target,
    selectedClass: "bg-sideby-blue-500 hover:bg-sideby-blue-600 text-white border-sideby-blue-500 shadow-lg font-bold", 
    unselectedClass: "bg-white hover:bg-sideby-blue-50 text-sideby-text-primary border-gray-300 hover:border-sideby-blue-400 font-semibold",
    pendingClass: "bg-sideby-blue-300 text-white border-sideby-blue-400 font-bold animate-pulse",
    readOnlySelectedClass: "bg-sideby-blue-200 text-sideby-blue-800 border-sideby-blue-300 font-bold cursor-default",
    readOnlyUnselectedClass: "bg-gray-100 text-gray-500 border-gray-200 cursor-default font-semibold"
  },
  { 
    level: 2, 
    label: "Well Aligned", 
    shortLabel: "Good", 
    icon: CheckCircle,
    selectedClass: "bg-sideby-teal-500 hover:bg-sideby-teal-600 text-white border-sideby-teal-500 shadow-lg font-bold", 
    unselectedClass: "bg-white hover:bg-sideby-teal-50 text-sideby-text-primary border-gray-300 hover:border-sideby-teal-400 font-semibold",
    pendingClass: "bg-sideby-teal-300 text-white border-sideby-teal-400 font-bold animate-pulse",
    readOnlySelectedClass: "bg-sideby-teal-200 text-sideby-teal-800 border-sideby-teal-300 font-bold cursor-default",
    readOnlyUnselectedClass: "bg-gray-100 text-gray-500 border-gray-200 cursor-default font-semibold"
  },
  { 
    level: 3, 
    label: "Perfect Fit", 
    shortLabel: "Perfect", 
    icon: Award,
    selectedClass: "bg-sideby-burgundy-600 hover:bg-sideby-burgundy-700 text-white border-sideby-burgundy-600 shadow-lg font-bold", 
    unselectedClass: "bg-white hover:bg-sideby-burgundy-50 text-sideby-text-primary border-gray-300 hover:border-sideby-burgundy-400 font-semibold",
    pendingClass: "bg-sideby-burgundy-300 text-white border-sideby-burgundy-400 font-bold animate-pulse",
    readOnlySelectedClass: "bg-sideby-burgundy-200 text-sideby-burgundy-800 border-sideby-burgundy-300 font-bold cursor-default",
    readOnlyUnselectedClass: "bg-gray-100 text-gray-500 border-gray-200 cursor-default font-semibold"
  }
];

export const OptimisticAlignmentRating = ({ 
  alignmentLevel, 
  onRatingChange,
  isCompact = true,
  readOnly = false,
  isSaving = false,
  pendingLevel,
  saveError
}: OptimisticAlignmentRatingProps) => {
  return (
    <div className="flex flex-col gap-3">
      {!isCompact && (
        <p className="text-sm font-bold text-sideby-text-primary tracking-wide">Alignment Level</p>
      )}
      <div className="flex gap-3">
        {alignmentLabels.map(({ level, label, shortLabel, icon: Icon, selectedClass, unselectedClass, pendingClass, readOnlySelectedClass, readOnlyUnselectedClass }) => {
          const isSelected = alignmentLevel === level;
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
              className={`px-4 py-3 text-xs font-semibold rounded-xl border-2 ${readOnly || isSaving ? '' : 'transition-all duration-200 hover:scale-[1.05] hover:shadow-md'} shadow-sm flex-1 h-12 ${buttonClass}`}
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
