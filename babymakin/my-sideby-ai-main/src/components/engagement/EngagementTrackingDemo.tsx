import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { useToast } from "@/hooks/use-toast";

/**
 * Demo component showing how to integrate the new engagement tracking system
 * This shows practical examples of tracking various user engagements
 */
export const EngagementTrackingDemo = () => {
  const {
    trackEngagement,
    trackFeatureUsage,
    trackToolInteraction,
    trackSessionCompletion,
    trackJourneyProgression,
    trackCompassQuartile,
    trackOnboardingCompleted,
    trackAppSessionStart
  } = useEngagementTracking();
  
  const { toast } = useToast();

  const handleTrackingDemo = async (type: string) => {
    try {
      switch (type) {
        case 'feature_usage':
          await trackFeatureUsage('engagement_tracking_demo', {
            demo_action: 'button_clicked',
            feature_version: '1.0'
          });
          break;
          
        case 'tool_interaction':
          await trackToolInteraction('demo_tool', 'click');
          break;
          
        case 'session_completion':
          await trackSessionCompletion({
            sessionType: 'demo_session',
            qualityScore: 95,
            duration: 30,
            isFirstReflection: false
          });
          break;
          
        case 'journey_progression':
          await trackJourneyProgression('new', 'exploring');
          break;
          
        case 'compass_quartile':
          await trackCompassQuartile(1);
          break;
          
        case 'onboarding_completed':
          await trackOnboardingCompleted();
          break;
          
        case 'app_session_start':
          await trackAppSessionStart();
          break;
          
        default:
          await trackEngagement('demo_engagement', {
            action: type,
            timestamp: new Date().toISOString()
          });
      }
      
      toast({
        title: "Engagement Tracked!",
        description: `Successfully logged ${type} engagement`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Tracking Failed",
        description: "Failed to log engagement",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Engagement Tracking Demo</CardTitle>
        <CardDescription>
          Try out the new comprehensive engagement tracking system that logs more user interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleTrackingDemo('feature_usage')}
            variant="outline"
          >
            Track Feature Usage
          </Button>
          
          <Button 
            onClick={() => handleTrackingDemo('tool_interaction')}
            variant="outline"
          >
            Track Tool Interaction
          </Button>
          
          <Button 
            onClick={() => handleTrackingDemo('session_completion')}
            variant="outline"
          >
            Track Session Completion
          </Button>
          
          <Button 
            onClick={() => handleTrackingDemo('journey_progression')}
            variant="outline"
          >
            Track Journey Progression
          </Button>
          
          <Button 
            onClick={() => handleTrackingDemo('compass_quartile')}
            variant="outline"
          >
            Track Compass Quartile
          </Button>
          
          <Button 
            onClick={() => handleTrackingDemo('onboarding_completed')}
            variant="outline"
          >
            Track Onboarding Completed
          </Button>
          
          <Button 
            onClick={() => handleTrackingDemo('app_session_start')}
            variant="outline"
          >
            Track App Session Start
          </Button>
          
          <Button 
            onClick={() => handleTrackingDemo('custom_engagement')}
            variant="outline"
          >
            Track Custom Engagement
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">What's New:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Community ID resolution from user memberships</li>
            <li>• Session completion tracking with journey progression</li>
            <li>• Upduo integration with automatic engagement logging</li>
            <li>• Comprehensive milestone and feature usage tracking</li>
            <li>• Improved activity tracking with real community association</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};