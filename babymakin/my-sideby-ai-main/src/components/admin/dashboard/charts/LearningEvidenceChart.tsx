
import React, { Suspense, lazy } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LazyAreaChart = lazy(() => import("recharts").then(module => ({ default: module.AreaChart })));
const LazyArea = lazy(() => import("recharts").then(module => ({ default: module.Area })));
const LazyResponsiveContainer = lazy(() => import("recharts").then(module => ({ default: module.ResponsiveContainer })));

interface LearningEvidenceChartProps {
  value: number;
  max: number;
}

const ChartSkeleton = () => (
  <div className="h-[200px] flex items-center justify-center">
    <Skeleton className="h-full w-full" />
  </div>
);

export const LearningEvidenceChart = ({ value, max }: LearningEvidenceChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Evidence of Learning per Hour</h3>
      <div className="relative h-[200px] flex items-center justify-center">
        <div className="absolute text-4xl font-bold z-10">{value}</div>
        <Suspense fallback={<ChartSkeleton />}>
          <LazyResponsiveContainer>
            <LazyAreaChart
              data={[{ value }]}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <LazyArea
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </LazyAreaChart>
          </LazyResponsiveContainer>
        </Suspense>
      </div>
    </Card>
  );
};
