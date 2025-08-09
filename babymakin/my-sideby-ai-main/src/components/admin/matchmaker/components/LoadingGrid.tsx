
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingGridProps {
  compact?: boolean;
  includeDeletedUsers: boolean;
  selectedCommunity: string;
  selectedCrew: string | null;
  showOnlyReflectionCompleted: boolean;
  showOnlyUnmatched: boolean;
  showAdminUsers: boolean;
  "data-testid"?: string;
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  compact = false,
  "data-testid": testId
}) => {
  const skeletonCount = compact ? 12 : 8;
  
  return (
    <div 
      className={`grid gap-3 ${
        compact 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
      data-testid={testId || "loading-grid"}
    >
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Card key={index} data-testid={`loading-user-card-${index}`}>
          <CardContent className={compact ? "p-2" : "p-4"}>
            <div className="animate-pulse space-y-2" data-testid={`loading-skeleton-${index}`}>
              <div 
                className="h-4 bg-gray-200 rounded w-3/4"
                data-testid={`loading-name-${index}`}
              ></div>
              <div 
                className="h-3 bg-gray-200 rounded w-1/2"
                data-testid={`loading-email-${index}`}
              ></div>
              <div className="flex gap-1" data-testid={`loading-badges-${index}`}>
                <div 
                  className="h-5 bg-gray-200 rounded w-12"
                  data-testid={`loading-badge-1-${index}`}
                ></div>
                <div 
                  className="h-5 bg-gray-200 rounded w-16"
                  data-testid={`loading-badge-2-${index}`}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
