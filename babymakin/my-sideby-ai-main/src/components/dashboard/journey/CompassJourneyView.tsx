import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Sparkles,
  Heart,
  Lock,
  CheckCircle2,
  Target,
  Lightbulb,
  Bot,
  Star
} from 'lucide-react';
import { useUserJourneyStage } from '@/hooks/user-journey/useUserJourneyStage';

interface CompassQuadrant {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
  detailedDescription: string;
  activities: {
    label: string;
    requirement?: string;
    isComplete?: boolean;
  }[];
  unlockRequirement: string;
  callToAction: string;
  isUnlocked?: boolean;
  progress?: number;
}

const getCompassQuadrants = (journeyData: any): CompassQuadrant[] => {
  const hasCompletedReflection = journeyData?.hasCompletedReflection || false;
  const hasActiveMatch = journeyData?.hasActiveMatch || false;
  const conversationCount = journeyData?.conversationCount || 0;
  const stage = journeyData?.stage || 'new';

  return [
    {
      id: 'match',
      title: 'Match',
      icon: Users,
      color: 'hsl(var(--red))',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      description: 'Connect with learning partners',
      detailedDescription: 'Build meaningful connections with fellow educators who share your interests and goals.',
      activities: [
        { 
          label: 'Complete your profile',
          requirement: 'Required for matching',
          isComplete: journeyData?.profileCompleted || false
        },
        { 
          label: 'Get matched with partners',
          requirement: 'Complete reflection first',
          isComplete: hasActiveMatch
        },
        { 
          label: 'Build your network',
          requirement: 'Stay active',
          isComplete: (journeyData?.matchCount || 0) > 1
        }
      ],
      unlockRequirement: 'Available after profile completion',
      callToAction: 'Find Your Learning Partner',
      isUnlocked: journeyData?.profileCompleted || false,
      progress: hasActiveMatch ? 100 : (journeyData?.profileCompleted ? 50 : 0)
    },
    {
      id: 'talk',
      title: 'Talk',
      icon: MessageSquare,
      color: 'hsl(var(--yellow))',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      description: 'Share your teaching toolbox',
      detailedDescription: 'Engage in structured "I use X for Y" conversations to share and discover teaching tools and methods.',
      activities: [
        { 
          label: 'Complete first conversation',
          requirement: 'Get matched first',
          isComplete: conversationCount > 0
        },
        { 
          label: 'Share your toolbox',
          requirement: 'Use "I use X for Y" framework',
          isComplete: conversationCount > 1
        },
        { 
          label: 'Discover new tools',
          requirement: 'Regular participation',
          isComplete: conversationCount > 3
        }
      ],
      unlockRequirement: 'Available after getting matched',
      callToAction: 'Start Toolbox Conversation',
      isUnlocked: hasActiveMatch,
      progress: Math.min((conversationCount / 3) * 100, 100)
    },
    {
      id: 'learn',
      title: 'Learn',
      icon: BookOpen,
      color: 'hsl(var(--green))',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      description: 'Deepen your reflection practice',
      detailedDescription: 'Complete your second reflection session and set meaningful yearly learning goals.',
      activities: [
        { 
          label: 'Complete first reflection',
          requirement: 'Initial onboarding step',
          isComplete: hasCompletedReflection
        },
        { 
          label: 'Complete second reflection',
          requirement: 'After first conversation',
          isComplete: stage === 'reflection_completed' || stage === 'active'
        },
        { 
          label: 'Set yearly learning goal',
          requirement: 'Part of second reflection',
          isComplete: stage === 'active'
        }
      ],
      unlockRequirement: 'Available after first conversation',
      callToAction: 'Complete Second Reflection',
      isUnlocked: conversationCount > 0,
      progress: hasCompletedReflection ? (stage === 'active' ? 100 : 66) : 0
    },
    {
      id: 'grow',
      title: 'Grow',
      icon: TrendingUp,
      color: 'hsl(var(--orange))',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      description: 'Master with AI assistance',
      detailedDescription: 'Create and improve your personalized AI teaching assistant to accelerate your mastery.',
      activities: [
        { 
          label: 'Create AI assistant',
          requirement: 'Complete learning phase',
          isComplete: false
        },
        { 
          label: 'Customize for your needs',
          requirement: 'Use AI tools regularly',
          isComplete: false
        },
        { 
          label: 'Apply in practice',
          requirement: 'Ongoing mastery',
          isComplete: false
        }
      ],
      unlockRequirement: 'Available after completing reflection phase',
      callToAction: 'Create AI Assistant',
      isUnlocked: stage === 'active',
      progress: stage === 'active' ? 25 : 0
    }
  ];
};

interface CompassJourneyViewProps {
  userStats?: {
    totalMatches: number;
    totalSessions: number;
    ideasGenerated: number;
    daysSinceStart: number;
  };
  className?: string;
}

export const CompassJourneyView: React.FC<CompassJourneyViewProps> = ({
  userStats = {
    totalMatches: 0,
    totalSessions: 0,
    ideasGenerated: 0,
    daysSinceStart: 0
  },
  className = ''
}) => {
  const { journeyData } = useUserJourneyStage();
  const compassQuadrants = getCompassQuadrants(journeyData);
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <span>Your Learning Compass</span>
          </CardTitle>
          <p className="text-muted-foreground">
            You're an active sideby learner! Continue your journey through these four dimensions.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.totalMatches}</div>
              <div className="text-xs text-muted-foreground">Partners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalSessions}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.ideasGenerated}</div>
              <div className="text-xs text-muted-foreground">Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.daysSinceStart}</div>
              <div className="text-xs text-muted-foreground">Days</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Compass Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {compassQuadrants.map((quadrant, index) => {
          const Icon = quadrant.icon;
          
          return (
            <Card 
              key={quadrant.id}
              className={`${quadrant.bgColor} border-2 transition-all duration-300 ${
                quadrant.isUnlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-60'
              }`}
              style={{ borderColor: quadrant.color }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-3 rounded-full text-white relative"
                      style={{ backgroundColor: quadrant.color }}
                    >
                      <Icon className="h-6 w-6" />
                      {!quadrant.isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: quadrant.color }}>
                        {quadrant.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {quadrant.description}
                      </p>
                    </div>
                  </div>
                  
                  {quadrant.isUnlocked && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${quadrant.color}20`,
                        color: quadrant.color,
                        borderColor: `${quadrant.color}40`
                      }}
                    >
                      {quadrant.progress === 100 ? 'Complete' : 'Active'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {quadrant.detailedDescription}
                </p>
                
                {/* Progress Bar */}
                {quadrant.isUnlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(quadrant.progress || 0)}%</span>
                    </div>
                    <Progress 
                      value={quadrant.progress || 0}
                      className="h-2"
                    />
                  </div>
                )}
                
                {/* Activities */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Key Activities:</h4>
                  {quadrant.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.isComplete ? (
                          <CheckCircle2 
                            className="h-4 w-4"
                            style={{ color: quadrant.color }}
                          />
                        ) : (
                          <div 
                            className="w-4 h-4 rounded-full border-2"
                            style={{ borderColor: quadrant.isUnlocked ? quadrant.color : 'hsl(var(--muted))' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${activity.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                          {activity.label}
                        </p>
                        {activity.requirement && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.requirement}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Call to Action */}
                <div className="pt-3 border-t">
                  {quadrant.isUnlocked ? (
                    <Button 
                      className="w-full text-white"
                      style={{ backgroundColor: quadrant.color }}
                      disabled={quadrant.progress === 100}
                    >
                      {quadrant.progress === 100 ? 'Completed!' : quadrant.callToAction}
                    </Button>
                  ) : (
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Lock className="h-4 w-4 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {quadrant.unlockRequirement}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Motivational Message */}
      <Card className="mt-6 bg-gradient-to-r from-primary/10 via-blue-50 to-green-50 dark:from-primary/5 dark:via-blue-950/10 dark:to-green-950/10">
        <CardContent className="pt-6 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-lg font-medium text-primary mb-2">
            Keep Growing!
          </p>
          <p className="text-muted-foreground">
            You're making great progress on your learning journey. Each conversation, 
            connection, and insight helps you grow as an educator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};