
import React, { useCallback, useMemo } from "react";
import { IdeaItem } from "../IdeaItem";
import { SavedItem } from "../types";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

interface OptimizedIdeasListProps {
  items: SavedItem[];
  onView: (item: SavedItem) => void;
  onExcitementChange: (e: React.MouseEvent, level: number, itemId: string) => void;
  onAlignmentChange: (e: React.MouseEvent, level: number, itemId: string) => void;
  comments?: any[];
}

export const OptimizedIdeasList = React.memo(({
  items,
  onView,
  onExcitementChange,
  onAlignmentChange,
  comments = []
}: OptimizedIdeasListProps) => {
  const { startMeasure, endMeasure } = usePerformanceMonitor('OptimizedIdeasList');

  // Memoize comments grouping to prevent recalculation
  const commentsByIdeaId = useMemo(() => {
    const grouped = comments.reduce((acc, comment) => {
      if (!acc[comment.idea_id]) {
        acc[comment.idea_id] = [];
      }
      acc[comment.idea_id].push(comment);
      return acc;
    }, {} as Record<string, any[]>);
    
    return grouped;
  }, [comments]);

  // Memoize handlers to prevent recreation
  const handleView = useCallback((item: SavedItem) => {
    startMeasure('itemView');
    onView(item);
    endMeasure('itemView');
  }, [onView, startMeasure, endMeasure]);

  const handleExcitementChange = useCallback((e: React.MouseEvent, level: number, itemId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    onExcitementChange(e, level, itemId);
  }, [onExcitementChange]);

  const handleAlignmentChange = useCallback((e: React.MouseEvent, level: number, itemId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    onAlignmentChange(e, level, itemId);
  }, [onAlignmentChange]);

  // Memoize the rendered items to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    return items.map((item) => {
      const itemComments = commentsByIdeaId[item.id] || [];
      const recentComment = itemComments.length > 0 
        ? itemComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

      return (
        <IdeaItem
          key={item.id}
          item={item}
          onView={handleView}
          onExcitementChange={handleExcitementChange}
          onAlignmentChange={handleAlignmentChange}
          comments={itemComments}
          recentComment={recentComment}
          hasActiveDiscussion={itemComments.length > 0}
        />
      );
    });
  }, [items, commentsByIdeaId, handleView, handleExcitementChange, handleAlignmentChange]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-sideby-text-muted">
        <p className="text-lg font-semibold">No ideas saved yet</p>
        <p className="text-sm mt-2">Start saving ideas to see them here!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {renderedItems}
    </div>
  );
});

OptimizedIdeasList.displayName = 'OptimizedIdeasList';
