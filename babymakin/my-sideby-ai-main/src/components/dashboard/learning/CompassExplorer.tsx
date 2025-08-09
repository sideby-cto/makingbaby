
import React from "react";
import { Card } from "@/components/ui/card";
import { useCompassProgress } from "@/hooks/useCompassProgress";
import { useCompassDescriptors } from "@/hooks/useCompassDescriptors";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, MessageCircle, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompassExplorerProps {
  userId: string | null;
}

const getColorClasses = (colorScheme: string) => {
  switch (colorScheme) {
    case 'blue':
      return "bg-blue-100 text-blue-800";
    case 'green':
      return "bg-green-100 text-green-800";
    case 'purple':
      return "bg-purple-100 text-purple-800";
    case 'orange':
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-semantic-surface-secondary text-semantic-text-primary";
  }
};

// Compass quartile colors matching the SVG icon
const getCompassColor = (stage: string) => {
  switch (stage) {
    case 'learn':
      return '#37d37b'; // Green from SVG
    case 'talk':
      return '#fc0'; // Yellow from SVG  
    case 'grow':
      return '#bf0059'; // Magenta from SVG
    case 'match':
      return '#f67201'; // Orange from SVG
    default:
      return '#e5e7eb'; // Gray for empty state
  }
};

export const CompassExplorer: React.FC<CompassExplorerProps> = ({ userId }) => {
  const { progress, isLoading: progressLoading } = useCompassProgress(userId);
  const { descriptors, isLoading: descriptorsLoading } = useCompassDescriptors();
  
  if (progressLoading || descriptorsLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-semantic-surface-secondary rounded mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-semantic-surface-secondary rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Support both old and new structure for backward compatibility
  const areas = {
    learn: progress?.learn_completed || progress?.quartile_1 || false,
    talk: progress?.talk_completed || progress?.quartile_2 || false,
    grow: progress?.grow_completed || progress?.quartile_3 || false,
    match: progress?.match_completed || progress?.quartile_4 || false
  };

  const iconComponents = {
    BookOpen,
    MessageCircle,
    TrendingUp,
    Users
  };

  return (
    <Card className="p-6">
      <h3 className="text-heading-md font-sans text-semantic-text-primary mb-4">
        Compass Explorer
      </h3>
      <p className="text-body-sm text-semantic-text-secondary mb-6">
        Master your learning journey through these four essential areas.
      </p>
      
      <div className="space-y-4">
        {descriptors?.map((descriptor) => {
          const isCompleted = areas[descriptor.stage as keyof typeof areas];
          const progressPercent = isCompleted ? 100 : 0;
          const IconComponent = iconComponents[descriptor.icon_name as keyof typeof iconComponents];
          
          return (
            <div 
              key={descriptor.stage}
              className="border rounded-lg p-4 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <Badge 
                      variant={isCompleted ? "default" : "outline"}
                      className={isCompleted ? getColorClasses(descriptor.color_scheme) : ""}
                    >
                      {descriptor.display_name}
                    </Badge>
                  </div>
                  {isCompleted && (
                    <span className="text-semantic-primary text-sm font-medium">
                      ✓ Complete
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-body-sm text-semantic-text-secondary mb-3">
                {descriptor.description}
              </p>
              
              <div className="relative">
                <Progress 
                  value={progressPercent} 
                  className="h-2 bg-gray-200"
                />
                {isCompleted && (
                  <div 
                    className="absolute top-0 left-0 h-2 rounded-full transition-all duration-700"
                    style={{ 
                      width: `${progressPercent}%`,
                      backgroundColor: getCompassColor(descriptor.stage)
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {progress?.progress_percentage === 100 && (
        <div className="mt-6 p-4 bg-semantic-primary/10 rounded-lg text-center">
          <p className="text-semantic-primary font-medium">
            🎉 Congratulations! You've mastered all areas of your compass journey!
          </p>
        </div>
      )}
    </Card>
  );
};
