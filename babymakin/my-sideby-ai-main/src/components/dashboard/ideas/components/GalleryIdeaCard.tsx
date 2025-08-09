
import React, { useMemo, useState } from "react";
import { Clock, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeaContent } from "./IdeaContent";
import { SavedItem } from "../types";

interface GalleryIdeaCardProps {
  item: SavedItem;
  onView: (item: SavedItem) => void;
  onAppreciate: (itemId: string) => void;
  onReflect: (itemId: string) => void;
  comments?: any[];
  recentComment?: any;
  hasActiveDiscussion?: boolean;
  appreciationCount?: number;
  isAppreciated?: boolean;
}

export const GalleryIdeaCard = React.memo(({
  item,
  onView,
  onAppreciate,
  onReflect,
  comments = [],
  recentComment,
  hasActiveDiscussion = false,
}: GalleryIdeaCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Memoize computed values - always use the latest item data from React Query
  const formattedDate = useMemo(() => new Date(item.created_at).toLocaleDateString(), [item.created_at]);

  // Get the border color based on value assessment - this will reflect persisted data
  const getBorderColor = () => {
    // Use the persisted excitement and alignment levels from the item
    const excitement = item.excitement_level || 0;
    const alignment = item.alignment_level || 0;
    
    if (excitement >= 3 && alignment >= 3) 
      return "border-l-sideby-burgundy-500";
    if (excitement >= 2 && alignment >= 2) 
      return "border-l-sideby-orange-500";
    if (excitement >= 2) 
      return "border-l-sideby-yellow-500";
    if (alignment >= 2) 
      return "border-l-sideby-blue-500";
    return "border-l-sideby-teal-500";
  };

  const handleCardClick = () => {
    onView(item);
  };

  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-200 ${getBorderColor()} border-l-4 pl-4 ${
        isHovered ? 'transform scale-[1.02] shadow-lg' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formattedDate}
            </span>
            {hasActiveDiscussion && (
              <div className="flex items-center gap-1 text-xs text-sideby-teal-600 font-medium">
                <div className="w-2 h-2 bg-sideby-teal-500 rounded-full animate-pulse"></div>
                Active discussion
              </div>
            )}
          </div>
          
          {/* Quick action buttons - shown on hover */}
          {isHovered && (
            <div className="flex items-center gap-1 opacity-0 animate-fade-in">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={(e) => handleQuickAction(e, () => onView(item))}
                title="View details"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={(e) => handleQuickAction(e, () => onReflect(item.id))}
                title="Add reflection"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <IdeaContent content={item.content} truncate={true} />
          
          {/* Recent comment preview - if exists */}
          {recentComment && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-sideby-teal-400 transition-all duration-200 hover:bg-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {recentComment.author?.first_name || 'Member'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(recentComment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {recentComment.content}
              </p>
            </div>
          )}

          {/* Comment count indicator */}
          {comments.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length} reflection{comments.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gray-50 bg-opacity-30 rounded-lg pointer-events-none" />
      )}
    </div>
  );
});

GalleryIdeaCard.displayName = 'GalleryIdeaCard';
