
import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExcitementRatingProps {
  excitementLevel: number;
  onRatingChange: (e: React.MouseEvent, level: number, itemId?: string) => void;
  itemId?: string;
  isCompact?: boolean;
  readOnly?: boolean;
}

export const ExcitementRating = ({
  excitementLevel,
  onRatingChange,
  itemId,
  isCompact = false,
  readOnly = false
}: ExcitementRatingProps) => {
  const handleRatingClick = (e: React.MouseEvent, level: number) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    onRatingChange(e, level, itemId);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((level) => (
        <Button
          key={level}
          variant="ghost"
          size={isCompact ? "sm" : "default"}
          className={`${isCompact ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} ${
            readOnly ? 'cursor-default' : 'hover:bg-yellow-50'
          }`}
          onClick={(e) => handleRatingClick(e, level)}
          disabled={readOnly}
        >
          <Star
            className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} ${
              level <= excitementLevel
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </Button>
      ))}
    </div>
  );
};
