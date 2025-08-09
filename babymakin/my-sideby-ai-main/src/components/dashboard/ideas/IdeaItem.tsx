
import React, { useState } from "react";
import { Clock, Eye, Star, Target, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExcitementRating } from "./components/ExcitementRating";
import { AlignmentRating } from "./components/AlignmentRating";
import { IdeaContent } from "./components/IdeaContent";
import { SavedItem } from "./types";

interface IdeaItemProps {
  item: SavedItem;
  onView: (item: SavedItem) => void;
  onExcitementChange: (e: React.MouseEvent, level: number, itemId: string) => void;
  onAlignmentChange: (e: React.MouseEvent, level: number, itemId: string) => void;
  comments?: any[];
  recentComment?: any;
  hasActiveDiscussion?: boolean;
  isUpdating?: boolean;
}

export const IdeaItem = ({
  item,
  onView,
  onExcitementChange,
  onAlignmentChange,
  comments = [],
  recentComment,
  hasActiveDiscussion = false,
  isUpdating = false,
}: IdeaItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    onView(item);
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Determine card styling based on ratings
  const getCardStyling = () => {
    const excitement = item.excitement_level || 0;
    const alignment = item.alignment_level || 0;
    
    if (excitement >= 3 && alignment >= 3) {
      return "border-l-4 border-l-classroom-orange bg-gradient-to-r from-classroom-orange/10 to-classroom-cream";
    }
    if (excitement >= 2 && alignment >= 2) {
      return "border-l-4 border-l-classroom-orange bg-gradient-to-r from-classroom-orange/10 to-classroom-cream";
    }
    if (excitement >= 2) {
      return "border-l-4 border-l-classroom-orange bg-gradient-to-r from-classroom-orange/5 to-classroom-cream";
    }
    if (alignment >= 2) {
      return "border-l-4 border-l-classroom-orange bg-gradient-to-r from-classroom-orange/5 to-classroom-cream";
    }
    return "border-l-4 border-l-classroom-border bg-classroom-cream";
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getCardStyling()} ${
        isUpdating ? 'opacity-60' : ''
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-classroom-orange" />
            <span className="text-sm text-classroom-text-secondary flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {/* Quick view button on hover */}
          {isHovered && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-80 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onView(item);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <IdeaContent content={item.content} truncate={true} />
        </div>

        {/* Ratings */}
        <div className="space-y-3" onClick={handleRatingClick}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-classroom-text-secondary flex items-center gap-1">
              <Star className="h-3 w-3" />
              Excitement
            </span>
            <ExcitementRating
              excitementLevel={item.excitement_level || 0}
              onRatingChange={onExcitementChange}
              itemId={item.id}
              isCompact={true}
              readOnly={isUpdating}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-classroom-text-secondary flex items-center gap-1">
              <Target className="h-3 w-3" />
              Alignment
            </span>
            <AlignmentRating
              alignmentLevel={item.alignment_level || 0}
              onRatingChange={onAlignmentChange}
              itemId={item.id}
              isCompact={true}
              readOnly={isUpdating}
            />
          </div>
        </div>

        {/* Type indicator */}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {item.type === 'idea' ? 'Personal Idea' : 'Saved Content'}
          </Badge>
          
          {(item.excitement_level >= 2 || item.alignment_level >= 2) && (
            <Badge variant="secondary" className="text-xs bg-classroom-orange/20 text-classroom-orange">
              High Interest
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
