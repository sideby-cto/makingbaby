
import React from "react";
import { Separator } from "@/components/ui/separator";
import { GalleryIdeaCard } from "./GalleryIdeaCard";
import { SavedItem } from "../types";

interface InsightsFeedProps {
  items: SavedItem[];
  onViewItem: (item: SavedItem) => void;
  onAppreciate: () => void;
  onReflect: () => void;
  comments: Record<string, any[]>;
  getRecentComment: (ideaId: string) => any;
  hasActiveDiscussion: (ideaId: string) => boolean;
}

export const InsightsFeed = ({
  items,
  onViewItem,
  onAppreciate,
  onReflect,
  comments,
  getRecentComment,
  hasActiveDiscussion
}: InsightsFeedProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <div className="p-6 hover:bg-gray-50 transition-colors duration-200">
            <GalleryIdeaCard
              item={item}
              onView={onViewItem}
              onAppreciate={onAppreciate}
              onReflect={onReflect}
              comments={comments[item.id] || []}
              recentComment={getRecentComment(item.id)}
              hasActiveDiscussion={hasActiveDiscussion(item.id)}
              appreciationCount={0}
              isAppreciated={false}
            />
          </div>
          {index < items.length - 1 && (
            <Separator className="bg-gray-100" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
