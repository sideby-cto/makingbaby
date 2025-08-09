import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CompassBadge } from "./CompassBadge";
import { CompassExplorer } from "./CompassExplorer";
import { Trophy } from "lucide-react";
import { isBackToSchoolLaunched } from "@/utils/badgeLaunchConfig";

interface CurrentProgressSectionProps {
  userId: string | null;
}

export const CurrentProgressSection: React.FC<CurrentProgressSectionProps> = ({ userId }) => {
  const isLaunched = isBackToSchoolLaunched();
  
  // Don't render anything if the badge hasn't launched yet
  if (!isLaunched) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-palette-highlighter-yellow/10 text-palette-highlighter-yellow">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-heading-md font-sans text-semantic-text-primary">
                Your Current Progress
              </CardTitle>
              <CardDescription className="text-body-sm text-semantic-text-secondary">
                Track your journey through the sideby compass
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <p className="text-body-md text-semantic-text-secondary mb-4">
              Continue building your foundation compass by completing activities in each area. 
              This essential compass helps you understand your learning style and connects you 
              with the right learning partners.
            </p>
          </div>
          
          {/* Compass Badge */}
          <CompassBadge userId={userId} />
          
          {/* Detailed Progress Explorer */}
          <CompassExplorer userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
};