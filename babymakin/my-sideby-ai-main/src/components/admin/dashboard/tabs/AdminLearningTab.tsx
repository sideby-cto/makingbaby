
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "@phosphor-icons/react";
import { TimePeriod } from "@/utils/timePeriodsGenerator";
import { TimePeriodsSelect } from "@/components/admin/dashboard/components/TimePeriodsSelect";
import { AdminLearningManagement } from "@/components/admin/learning/AdminLearningManagement";
import { CompassDescriptorSettings } from "@/components/admin/compass/CompassDescriptorSettings";

interface AdminLearningTabProps {
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  timePeriodsData: Record<TimePeriod, any>;
  setShowUpduoSessions: (show: boolean) => void;
}

export const AdminLearningTab: React.FC<AdminLearningTabProps> = ({
  timePeriod,
  setTimePeriod,
  timePeriodsData,
  setShowUpduoSessions
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-heading-lg text-semantic-text-primary font-sans">Learning Data</h2>
        <TimePeriodsSelect 
          value={timePeriod} 
          onValueChange={setTimePeriod} 
          timePeriodsData={timePeriodsData} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compass Management */}
        <div>
          <AdminLearningManagement />
        </div>
        
        {/* Upduo Sessions */}
        <div>
          <Card className="p-6 flex flex-col justify-between h-full border border-semantic-border bg-white shadow-sm rounded-xl">
            <div>
              <h3 className="text-heading-md text-semantic-text-primary font-sans mb-2">upduo Sessions</h3>
              <p className="text-semantic-text-secondary text-body-md mb-4">
                Review recent upduo sessions and their transcripts.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowUpduoSessions(true)}
              className="w-full mt-4 flex items-center"
            >
              <BookOpen size={16} weight="regular" className="mr-2" />
              View Sessions
            </Button>
          </Card>
        </div>
      </div>

      {/* Compass Descriptor Settings */}
      <div className="mt-8">
        <CompassDescriptorSettings />
      </div>
    </div>
  );
};
