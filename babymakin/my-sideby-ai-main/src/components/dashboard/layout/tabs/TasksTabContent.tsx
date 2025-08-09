
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { InitialTasksList } from "@/components/dashboard/onboarding/InitialTasksList";
import type { JourneyData } from "@/hooks/user-journey/types";

interface TasksTabContentProps {
  userId: string;
  loading: boolean;
  journeyData: JourneyData | undefined;
}

export const TasksTabContent: React.FC<TasksTabContentProps> = ({ 
  userId, 
  loading, 
  journeyData 
}) => {
  return (
    <div className="space-y-6">
      {loading ? (
        <Skeleton className="h-[200px] w-full" />
      ) : (
        <>
          {/* Tasks List - Show for users who haven't completed the journey */}
          {journeyData?.stage !== 'active_learner' && (
            <InitialTasksList userId={userId} journeyData={journeyData} />
          )}
        </>
      )}
    </div>
  );
};
