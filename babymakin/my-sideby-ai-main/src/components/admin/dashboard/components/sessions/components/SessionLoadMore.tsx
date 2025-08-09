
import React from "react";
import { Loader2 } from "lucide-react";

interface SessionLoadMoreProps {
  isLoading: boolean;
  loadMoreRef: (node: Element | null) => void;
}

export const SessionLoadMore = ({
  isLoading,
  loadMoreRef
}: SessionLoadMoreProps) => {
  return (
    <div 
      ref={loadMoreRef}
      className="flex justify-center items-center py-3 my-2 bg-gradient-to-r from-brand-tertiary/20 to-brand-secondary/20 rounded-lg border border-brand-primary/20 transition-opacity"
      style={{ minHeight: '48px' }}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2 animate-in fade-in duration-300">
          <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
          <span className="text-sm font-bold text-brand-primary">Loading more...</span>
        </div>
      ) : (
        <span className="text-sm font-medium text-muted-foreground">Scroll to load more</span>
      )}
    </div>
  );
};
