import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Target
} from 'lucide-react';
import { AnimatedScheduleButton } from '@/components/ui/animated-schedule-button';
import { useToast } from '@/hooks/use-toast';

interface PostSessionOptInFlowProps {
  userId: string;
  sessionCompletion: {
    id: string;
    session_type: string;
    journey_stage_after: string;
    confidence_score: number;
    completed_at: string;
    next_session_required: boolean;
  };
  onNextSessionScheduled: (completionId: string) => void;
  onDismiss: () => void;
}

export const PostSessionOptInFlow: React.FC<PostSessionOptInFlowProps> = ({
  userId,
  sessionCompletion,
  onNextSessionScheduled,
  onDismiss
}) => {
  const [showOptIn, setShowOptIn] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  // Auto-dismiss after 2 minutes if no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showOptIn) {
        onDismiss();
      }
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, [showOptIn, onDismiss]);

  const handleScheduleNext = async () => {
    setIsScheduling(true);
    try {
      // Mark as scheduled
      onNextSessionScheduled(sessionCompletion.id);
      
      // Show success message
      toast({
        title: "Next Session Planned!",
        description: "We'll help you schedule your next learning session soon.",
      });
      
      // Dismiss the flow
      setShowOptIn(false);
      setTimeout(onDismiss, 1000);
    } catch (error) {
      console.error('Error scheduling next session:', error);
      toast({
        title: "Scheduling Error",
        description: "Failed to schedule next session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleMaybeLater = () => {
    toast({
      title: "No problem!",
      description: "You can always schedule your next session from your dashboard.",
    });
    setShowOptIn(false);
    setTimeout(onDismiss, 1000);
  };

  if (!showOptIn) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Session completion recorded!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-primary/20 p-3 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-primary">
          🎉 Session Complete!
        </CardTitle>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {Math.round(sessionCompletion.confidence_score * 100)}% Confidence
          </Badge>
          <Badge variant="outline">
            {sessionCompletion.session_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Journey Progress</span>
            <span className="font-medium capitalize">
              {sessionCompletion.journey_stage_after.replace('_', ' ')}
            </span>
          </div>
          <Progress 
            value={getJourneyProgress(sessionCompletion.journey_stage_after)} 
            className="h-2"
          />
        </div>

        {/* Next Session Recommendation */}
        {sessionCompletion.next_session_required && (
          <div className="bg-white/80 p-4 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-primary mb-1">
                  Ready for Your Next Session?
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {getNextSessionMessage(sessionCompletion.journey_stage_after)}
                </p>
                
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  <span>Recommended timing: Within 3-5 days</span>
                </div>

                <div className="flex space-x-2">
                  <AnimatedScheduleButton
                    onSchedule={handleScheduleNext}
                    isScheduling={isScheduling}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleMaybeLater}
                    className="px-4 h-9"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Summary */}
        <div className="bg-white/60 p-3 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Session Summary</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                Type: {sessionCompletion.session_type}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(sessionCompletion.completed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {!sessionCompletion.next_session_required && (
          <div className="text-center">
            <Button variant="outline" onClick={onDismiss}>
              Continue to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getJourneyProgress(stage: string): number {
  const stageProgress: Record<string, number> = {
    'getting_started': 10,
    'first_session_complete': 25,
    'awaiting_match': 40,
    'matched': 60,
    'session_complete': 80,
    'active_learner': 100
  };
  return stageProgress[stage] || 0;
}

function getNextSessionMessage(stage: string): string {
  switch (stage) {
    case 'first_session_complete':
      return "Build on your momentum with another learning session. This will help you get matched with a learning partner faster.";
    case 'session_complete':
      return "Great work completing a session with your partner! Ready to continue your learning journey together?";
    case 'active_learner':
      return "You're on a roll! Schedule your next session to maintain your learning momentum.";
    default:
      return "Continue building your learning practice with regular sessions.";
  }
}