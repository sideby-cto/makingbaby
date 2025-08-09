
import React from "react";
import { Loader2, FileX, Search } from "lucide-react";
import { SessionsEmptyState } from "../SessionsEmptyState";

interface EmptyStateRendererProps {
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  sessions: any[];
}

export const EmptyStateRenderer = ({
  isLoading,
  error,
  searchTerm,
  sessions
}: EmptyStateRendererProps) => {
  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-brand-tertiary/30 to-brand-secondary/30 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
          <p className="font-bold text-brand-primary">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 bg-destructive/10 rounded-full mb-6">
          <FileX className="h-16 w-16 text-destructive" />
        </div>
        <h3 className="text-xl font-black font-display text-foreground mb-2">Error Loading Sessions</h3>
        <p className="text-muted-foreground font-medium max-w-md">
          {error.message || "Something went wrong. Please try again."}
        </p>
      </div>
    );
  }

  if (sessions.length === 0 && searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 bg-gradient-to-br from-brand-tertiary/30 to-brand-secondary/30 rounded-full mb-6">
          <Search className="h-16 w-16 text-brand-primary" />
        </div>
        <h3 className="text-xl font-black font-display text-foreground mb-2">No Matching Sessions</h3>
        <p className="text-muted-foreground font-medium max-w-md">
          Try adjusting your search or filters to find what you're looking for
        </p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return <SessionsEmptyState />;
  }

  return null;
};
