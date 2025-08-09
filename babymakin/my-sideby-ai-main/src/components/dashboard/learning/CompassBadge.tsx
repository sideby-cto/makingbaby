import React from "react";
import { Card } from "@/components/ui/card";
import { useCompassProgress } from "@/hooks/useCompassProgress";
import { CompassQuartileProgress } from "@/types/database";
import { cn } from "@/lib/utils";

// Import SVG assets
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

interface CompassBadgeProps {
  userId: string | null;
  className?: string;
}

// Function to determine which SVG to use based on completed areas
const getCompassSvg = (progress: CompassQuartileProgress | null) => {
  if (!progress) return StartSvg;
  
  // Map the 4 compass areas to their corresponding colors: Learn=G, Talk=Y, Grow=M, Match=O
  const quartiles = [
    progress.learn_completed ? 'G' : null,  // Learn = Green (Q1)
    progress.talk_completed ? 'Y' : null,   // Talk = Yellow (Q2)
    progress.grow_completed ? 'M' : null,   // Grow = Magenta (Q3)
    progress.match_completed ? 'O' : null   // Match = Orange (Q4)
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
    <div className="relative w-24 h-24 mx-auto mb-3">
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

export const CompassBadge: React.FC<CompassBadgeProps> = ({ userId, className }) => {
  const { progress, isLoading } = useCompassProgress(userId);
  
  if (isLoading) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-semantic-surface-secondary animate-pulse" />
        <div className="h-4 bg-semantic-surface-secondary rounded animate-pulse mb-2" />
        <div className="h-3 bg-semantic-surface-secondary rounded animate-pulse" />
      </Card>
    );
  }

  const completedAreas = [
    progress?.learn_completed,
    progress?.talk_completed, 
    progress?.grow_completed,
    progress?.match_completed
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedAreas / 4) * 100);

  return (
    <Card className={cn(
      "p-6 text-center transition-all duration-300 hover:shadow-lg",
      progressPercentage === 100 && "border-semantic-primary",
      className
    )}>
      <CompassIcon progress={progress} progressPercentage={progressPercentage} />
      
      <h3 className="text-heading-sm font-sans text-semantic-text-primary mb-2">
        Back to School Compass
      </h3>
      
      <div className="text-body-sm text-semantic-text-secondary mb-3">
        {progressPercentage === 100 ? (
          <span className="text-semantic-primary font-medium">
            🎉 Compass Complete!
          </span>
        ) : (
          <span>
            {completedAreas} of 4 areas completed
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-semantic-surface-secondary rounded-full h-2 mb-2">
        <div 
          className="bg-gradient-to-r from-semantic-primary to-semantic-primary-variant h-2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="text-caption text-semantic-text-tertiary">
        {progressPercentage}% Complete
      </div>
      
      {progressPercentage === 100 && progress?.completed_at && (
        <div className="mt-3 text-caption text-semantic-primary">
          Completed {new Date(progress.completed_at).toLocaleDateString()}
        </div>
      )}
    </Card>
  );
};