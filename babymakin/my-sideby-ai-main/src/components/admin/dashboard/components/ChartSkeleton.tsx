
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton = ({ height = 200 }: ChartSkeletonProps) => (
  <Card className="p-6" data-testid="chart-skeleton-card">
    <Skeleton className="h-8 w-48 mb-4" role="status" />
    <Skeleton 
      className="w-full" 
      style={{ height: `${height}px` }} 
      role="status" 
    />
  </Card>
);
