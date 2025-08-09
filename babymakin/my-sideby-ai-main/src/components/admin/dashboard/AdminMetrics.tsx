
import React, { useState, Suspense, lazy } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartSkeleton } from "./components/ChartSkeleton";
import { AdminActionsCard } from "./components/AdminActionsCard";
import { useProcessGaps } from "@/hooks/useProcessGaps";
import { useUserTools } from "@/hooks/useUserTools";
import { generateTimePeriodsData, TimePeriod } from "@/utils/timePeriodsGenerator";

const LazyLearningTargetsChart = lazy(() => import("./charts/LearningTargetsChart").then(module => ({ default: module.LearningTargetsChart })));
const LazyProcessGapsChart = lazy(() => import("./charts/ProcessGapsChart").then(module => ({ default: module.ProcessGapsChart })));
const LazySidebyActivityChart = lazy(() => import("./charts/SidebyActivityChart").then(module => ({ default: module.SidebyActivityChart })));

const AdminMetrics = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const { processGaps, closeGapMutation, addGapMutation } = useProcessGaps();
  const { userTools } = useUserTools();
  const timePeriodsData = generateTimePeriodsData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Learning Targets</CardTitle>
          <CardDescription>Progress on identified learning targets</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ChartSkeleton />}>
            <LazyLearningTargetsChart
              timePeriod={timePeriod}
              timePeriodsData={timePeriodsData}
              onTimePeriodChange={setTimePeriod}
            />
          </Suspense>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Coming soon - currently showing dummy data
          </p>
        </CardContent>
      </Card>
      
      <div>
        <AdminActionsCard userTools={userTools} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
          <CardDescription>Recent user engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ChartSkeleton />}>
            <LazySidebyActivityChart />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Process Gaps</CardTitle>
          <CardDescription>Current identified issues</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ChartSkeleton />}>
            <LazyProcessGapsChart
              processGaps={processGaps}
              onAddGap={(description) => addGapMutation.mutate(description)}
              onCloseGap={(gapId) => closeGapMutation.mutate(gapId)}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMetrics;
