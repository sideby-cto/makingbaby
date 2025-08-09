import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge, UserBadge } from '@/types/database';
import { useCompassProgress } from '@/hooks/useCompassProgress';
import { CompassQuartileProgress } from '@/types/database';

// Import SVG assets for compass visualization
import StartSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_Start.svg";
import GSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_G.svg";
import MSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_M.svg";
import OSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_O.svg";
import YSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_Y.svg";
import GYSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_GY.svg";
import YMSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_YM.svg";
import YOSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_YO.svg";
import GMSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_GM.svg";
import GOSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_GO.svg";
import OMSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_OM.svg";
import GYMSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_GYM.svg";
import GYOSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_GYO.svg";
import YOMSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_YOM.svg";
import GOMSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_GOM.svg";
import FullSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_Full.svg";

// Function to determine which SVG to use based on completed quartiles
const getCompassSvg = (progress: CompassQuartileProgress | null) => {
  if (!progress) return StartSvg;
  
  const quartiles = [
    progress.quartile_1 ? 'G' : null,
    progress.quartile_2 ? 'Y' : null, 
    progress.quartile_3 ? 'M' : null,
    progress.quartile_4 ? 'O' : null
  ].filter(Boolean);
  
  const quartileKey = quartiles.join('');
  
  const svgMap: Record<string, string> = {
    '': StartSvg,
    'G': GSvg,
    'Y': YSvg,
    'M': MSvg,
    'O': OSvg,
    'GY': GYSvg,
    'YM': YMSvg,
    'YO': YOSvg,
    'GM': GMSvg,
    'GO': GOSvg,
    'MO': OMSvg,
    'GYM': GYMSvg,
    'GYO': GYOSvg,
    'YMO': YOMSvg,
    'GMO': GOMSvg,
    'GYMO': FullSvg
  };
  
  return svgMap[quartileKey] || StartSvg;
};

const CompassIcon: React.FC<{ progress: CompassQuartileProgress | null; progressPercentage: number }> = ({ progress, progressPercentage }) => {
  const compassSvg = getCompassSvg(progress);
  
  return (
    <div className="relative w-16 h-16 mx-auto mb-3">
      {/* SVG Compass */}
      <img 
        src={compassSvg} 
        alt="Compass progress" 
        className="w-full h-full transition-all duration-500 ease-out"
      />
      
      {/* Glow effect when complete */}
      {progressPercentage === 100 && (
        <div className="absolute -inset-1 bg-gradient-to-r from-semantic-primary to-semantic-primary-variant rounded-full opacity-20 blur animate-pulse" />
      )}
    </div>
  );
};

interface BadgeRequirementProps {
  label: string;
  completed: boolean;
}

const BadgeRequirement: React.FC<BadgeRequirementProps> = ({ label, completed }) => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      {completed ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-300 dark:text-gray-600" />
      )}
      <span className={completed ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
};

interface BadgeCardProps {
  badge: Badge;
  userBadge?: UserBadge;
  userId?: string | null;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, userBadge, userId }) => {
  const progress = userBadge?.progress || 0;
  const isCompleted = userBadge?.is_completed || false;
  const requirements = badge.requirements || {};
  const userMetadata = userBadge?.metadata || {};
  
  // Use compass progress for "Back to School Compass" badge
  const isCompassBadge = badge.name === "Back to School Compass";
  const { progress: compassProgress, isLoading: compassLoading } = useCompassProgress(isCompassBadge ? userId : null);
  
  // Calculate compass-specific progress if this is a compass badge
  const compassCompletedQuartiles = compassProgress ? [
    compassProgress.quartile_1,
    compassProgress.quartile_2, 
    compassProgress.quartile_3,
    compassProgress.quartile_4
  ].filter(Boolean).length : 0;
  
  const compassProgressPercentage = Math.round((compassCompletedQuartiles / 4) * 100);
  
  // Use compass progress if available, otherwise fall back to userBadge progress
  const finalProgress = isCompassBadge && compassProgress ? compassProgressPercentage / 100 : progress;
  const finalIsCompleted = isCompassBadge && compassProgress ? compassProgressPercentage === 100 : isCompleted;
  
  // Requirements status (for "Back to School" badge)
  const schedulerAdded = userMetadata.scheduler_added || requirements.scheduler_added || false;
  const toolsCount = userMetadata.tools_count || requirements.tools_count || 0;
  const requiredToolsCount = requirements.required_tools_count || 5; // Default to 5 if not specified
  const learningGoalCreated = userMetadata.learning_goal_created || requirements.learning_goal_created || false;

  return (
    <Card className={`overflow-hidden transition-all ${finalIsCompleted ? 'border-primary' : 'border-border'}`}>
      <CardHeader className="relative pb-2">
        <div className="absolute top-2 right-2">
          {finalIsCompleted && <CheckCircle className="h-5 w-5 text-primary" />}
        </div>
        <div className="flex justify-center mb-2">
          {isCompassBadge ? (
            <CompassIcon progress={compassProgress} progressPercentage={compassProgressPercentage} />
          ) : (
            <div className="bg-muted p-3 rounded-full">
              <Award className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
        <CardTitle className="text-center">{badge.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center mb-4">{badge.description}</CardDescription>
        
        {badge.name === "Back to School" && (
          <div className="space-y-2 mb-4">
            <BadgeRequirement 
              label={`Add scheduler to your toolbox`} 
              completed={schedulerAdded} 
            />
            <BadgeRequirement 
              label={`Set up ${requiredToolsCount} other tools (${toolsCount}/${requiredToolsCount})`} 
              completed={toolsCount >= requiredToolsCount} 
            />
            <BadgeRequirement 
              label="Create a professional learning goal" 
              completed={learningGoalCreated} 
            />
          </div>
        )}
        
        {!finalIsCompleted && (
          <div className="space-y-2">
            <Progress value={finalProgress * 100} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {isCompassBadge ? (
                `${compassCompletedQuartiles} of 4 quartiles completed (${Math.round(finalProgress * 100)}%)`
              ) : (
                `${Math.round(finalProgress * 100)}% Complete`
              )}
            </p>
          </div>
        )}
        
        {finalIsCompleted && isCompassBadge && (
          <div className="text-center mb-4">
            <span className="text-semantic-primary font-medium">
              🎉 Compass Complete!
            </span>
            {compassProgress?.completed_at && (
              <div className="mt-2 text-caption text-semantic-primary">
                Completed {new Date(compassProgress.completed_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
      {finalIsCompleted && badge.reward_description && (
        <CardFooter className="bg-muted/50 px-6 py-3">
          <p className="text-sm text-center w-full">
            <span className="font-medium">Reward:</span> {badge.reward_description}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};