import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Settings,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  Flag
} from 'lucide-react';

interface JourneyStage {
  stage: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const journeyStages: JourneyStage[] = [
  {
    stage: 'getting_started',
    label: 'Join sideby',
    icon: User,
    description: 'Welcome to your learning journey',
    color: 'hsl(var(--primary))'
  },
  {
    stage: 'profile_setup',
    label: 'Set up profile',
    icon: Settings,
    description: 'Tell us about your teaching experience',
    color: 'hsl(var(--blue))'
  },
  {
    stage: 'first_session_complete',
    label: 'Reflect',
    icon: CheckCircle,
    description: 'Complete your first reflection session',
    color: 'hsl(var(--green))'
  },
  {
    stage: 'awaiting_match',
    label: 'Get matched',
    icon: Clock,
    description: 'We\'re finding your perfect learning partner',
    color: 'hsl(var(--orange))'
  },
  {
    stage: 'matched',
    label: 'Meet your partner',
    icon: Users,
    description: 'You\'ve been matched with a learning partner',
    color: 'hsl(var(--red))'
  },
  {
    stage: 'scheduling_session',
    label: 'Find time',
    icon: Calendar,
    description: 'Schedule your conversation with your partner',
    color: 'hsl(var(--primary))'
  },
  {
    stage: 'session_complete',
    label: 'Have conversation',
    icon: MessageSquare,
    description: 'Connect with your partner through upduo',
    color: 'hsl(var(--green))'
  },
  {
    stage: 'active_learner',
    label: 'Get an idea',
    icon: Sparkles,
    description: 'Continue growing and learning together',
    color: 'hsl(var(--orange))'
  },
  {
    stage: 'dashboard_connection',
    label: 'Connect your Small Wins Dashboard',
    icon: Flag,
    description: 'Coming soon - Track your progress with our dashboard',
    color: 'hsl(var(--muted-foreground))'
  }
];

interface LinearJourneyProgressProps {
  currentStage: string;
  className?: string;
}

export const LinearJourneyProgress: React.FC<LinearJourneyProgressProps> = ({
  currentStage,
  className = ''
}) => {
  const currentStageIndex = journeyStages.findIndex(stage => stage.stage === currentStage);
  
  // Filter out optional dashboard step for progress calculation unless user has reached active_learner
  const coreStages = journeyStages.filter(stage => 
    stage.stage !== 'dashboard_connection' || currentStage === 'active_learner' || currentStageIndex >= journeyStages.length - 2
  );
  
  // Calculate progress: if user is on profile_setup or later, getting_started is always complete
  let effectiveCompletedStages = currentStageIndex >= 0 ? currentStageIndex + 1 : 1;
  if (currentStage === 'profile_setup' || currentStageIndex > 0) {
    // Ensure getting_started is counted as complete
    effectiveCompletedStages = Math.max(effectiveCompletedStages, currentStageIndex + 1);
  }
  const progressPercentage = (effectiveCompletedStages / coreStages.length) * 100;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Your Learning Journey</span>
        </CardTitle>
        <Progress value={progressPercentage} className="h-2 mt-4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {journeyStages.map((stage, index) => {
          // Special logic: if user is authenticated and on profile_setup or later, 
          // always show getting_started (Join sideby) as completed
          const isGettingStartedCompleted = stage.stage === 'getting_started' && 
            (currentStage === 'profile_setup' || currentStageIndex > 0);
          
          const isCompleted = index < currentStageIndex || isGettingStartedCompleted;
          const isCurrent = index === currentStageIndex;
          const isUpcoming = index > currentStageIndex && !isGettingStartedCompleted;
          const isDashboardStep = stage.stage === 'dashboard_connection';
          const showDashboardStep = isDashboardStep && (currentStage === 'active_learner' || currentStageIndex >= journeyStages.length - 2);
          
          // Skip dashboard step if user hasn't reached active_learner stage
          if (isDashboardStep && !showDashboardStep) {
            return null;
          }
          
          const Icon = stage.icon;
          
          // Special milestone marker styling for completed "Join sideby" stage
          if (stage.stage === 'getting_started' && isGettingStartedCompleted) {
            return (
              <div
                key={stage.stage}
                className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 transition-all duration-300 hover:shadow-lg"
              >
                {/* Flag pole effect */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                
                <div className="flex items-center p-4 space-x-4">
                  {/* Flag icon instead of regular icon */}
                  <div className="relative">
                    <div className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg">
                      <Flag className="h-5 w-5" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-primary text-lg">
                        Welcome to sideby!
                      </h4>
                      <Badge className="bg-primary text-primary-foreground font-medium">
                        Milestone Reached
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      You've successfully joined the sideby community
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Joined sideby</span>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-4 h-4 rounded-full bg-primary/20"></div>
                    <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                  </div>
                </div>
              </div>
            );
          }
          
          // Special styling for dashboard connection step
          if (isDashboardStep) {
            return (
              <div
                key={stage.stage}
                className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 bg-muted/30 border border-dashed border-muted-foreground/30"
              >
                <div className="p-2 rounded-full bg-muted-foreground/20 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-muted-foreground">
                      {stage.label}
                    </h4>
                    <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                      Coming Soon
                    </Badge>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stage.description}
                  </p>
                </div>
                
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              </div>
            );
          }

          return (
            <div
              key={stage.stage}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 ${
                isCurrent 
                  ? 'bg-primary/10 border border-primary/20' 
                  : isCompleted
                  ? 'bg-green-50 dark:bg-green-950/20'
                  : 'bg-muted/50'
              }`}
            >
              <div className={`p-2 rounded-full ${
                isCurrent
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={`font-medium ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                  }`}>
                    {stage.label}
                  </h4>
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Complete
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="default">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stage.description}
                </p>
              </div>
              
              <div className={`w-3 h-3 rounded-full ${
                isCompleted 
                  ? 'bg-green-500' 
                  : isCurrent 
                  ? 'bg-primary animate-pulse' 
                  : 'bg-muted'
              }`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};