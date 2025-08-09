
import React from "react";
import { IdeaItem } from "./IdeaItem";
import { SavedItem } from "./types";

interface IdeasListProps {
  items: SavedItem[];
  onViewItem: (item: SavedItem) => void;
  onExcitementChange: (e: React.MouseEvent, level: number, itemId: string) => void;
  onAlignmentChange: (e: React.MouseEvent, level: number, itemId: string) => void;
  comments?: Record<string, any[]>;
  hasActiveDiscussion?: (ideaId: string) => boolean;
  getRecentComment?: (ideaId: string) => any;
  isUpdating?: boolean;
}

export const IdeasList = ({
  items,
  onViewItem,
  onExcitementChange,
  onAlignmentChange,
  comments = {},
  hasActiveDiscussion = () => false,
  getRecentComment = () => null,
  isUpdating = false,
}: IdeasListProps) => {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <IdeaItem
          key={item.id}
          item={item}
          onView={onViewItem}
          onExcitementChange={onExcitementChange}
          onAlignmentChange={onAlignmentChange}
          comments={comments[item.id] || []}
          recentComment={getRecentComment(item.id)}
          hasActiveDiscussion={hasActiveDiscussion(item.id)}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
};
