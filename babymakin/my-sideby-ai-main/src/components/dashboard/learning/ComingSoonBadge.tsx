import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Clock, Bell, BellOff, Calendar } from "lucide-react";
import { ConsolidatedOptInButton } from "@/components/ui/consolidated-opt-in-button";
import { useBadgeOptIns } from "@/hooks/useBadgeOptIns";
import { useBadges } from "@/hooks/useBadges";
import { useCompassDescriptors } from "@/hooks/useCompassDescriptors";
import { getNextUpcomingBadge, getTimeUntilLaunch, isBackToSchoolLaunched, BACK_TO_SCHOOL_BADGE_ID } from "@/utils/badgeLaunchConfig";
import { useToast } from "@/hooks/use-toast";
import StartSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_Start.svg";
import FullSvg from "@/components/badges/Achieve/Sideby_GraphicElements_Achieve_Full.svg";
interface ComingSoonBadgeProps {
  userId: string | null;
}

// Fallback badge features for the coming soon badge
const BADGE_FEATURES = {
  "ai-resolutions": ["Set ambitious yet achievable AI learning goals for the new year", "Create a structured plan for AI skill development", "Track progress on your AI integration resolutions", "Build sustainable AI habits for long-term success"],
  "back-to-school": ["Set up your AI toolbox with essential productivity tools", "Create a custom AI assistant tailored to your goals", "Define clear, actionable objectives for your learning journey", "Get logistics help for organizing your academic and professional life"],
  "ai-onward": ["Audit your current AI tools and identify gaps", "Implement advanced AI workflows to maintain momentum", "Develop strategies to avoid AI implementation regression", "Create accountability systems for consistent AI usage"],
  "ai-refresh": ["Conduct a comprehensive review of your AI toolkit", "Eliminate redundant or ineffective AI tools", "Streamline your AI workflows for maximum efficiency", "Update your AI knowledge with latest developments"]
};
export const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({
  userId
}) => {
  const {
    badges
  } = useBadges(userId);
  const {
    descriptors
  } = useCompassDescriptors();
  const {
    isOptedIn,
    optInToBadge,
    optOutOfBadge,
    updateNotificationPreference,
    optIns
  } = useBadgeOptIns(userId);
  const {
    toast
  } = useToast();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Get the next upcoming badge
  const nextBadge = getNextUpcomingBadge();

  // If no upcoming badges, don't render anything
  if (!nextBadge) {
    return null;
  }

  // Generate enhanced description from compass descriptors for back-to-school badge
  const generateEnhancedDescription = () => {
    if (nextBadge.id !== "back-to-school") {
      return nextBadge.description;
    }
    if (!descriptors || descriptors.length === 0) {
      return "Get AI-ready for the new academic year with our comprehensive toolkit covering essential productivity tools, custom assistant creation, goal setting, and logistics support.";
    }
    const compassAreas = descriptors.filter(d => ['learn', 'talk', 'grow', 'match'].includes(d.stage)).map(d => d.display_name.toLowerCase()).join(', ');
    return `Get AI-ready for the new academic year with our comprehensive compass covering ${compassAreas}. This badge provides essential tools for setting up your AI productivity toolkit, creating custom assistants, and organizing your learning journey for maximum success.`;
  };

  // Find the badge from the database with robust matching
  // First try exact name match, then by configured badge ID
  const badgeData = badges.find(badge => badge.name === nextBadge.name) || badges.find(badge => badge.id === BACK_TO_SCHOOL_BADGE_ID);
  const displayData = {
    id: nextBadge.id,
    name: badgeData?.name || nextBadge.name,
    description: badgeData?.description || generateEnhancedDescription(),
    features: BADGE_FEATURES[nextBadge.id as keyof typeof BADGE_FEATURES] || [],
    estimatedDuration: "4-5 weeks",
    launchDate: nextBadge.launchDate
  };
  const badgeId = badgeData?.id || nextBadge.id;
  const isUserOptedIn = badgeData ? isOptedIn(badgeData.id) : false;
  const userOptIn = badgeData ? optIns.find(optIn => optIn.badge_id === badgeData.id) : null;
  const notificationsEnabled = userOptIn?.notifications_enabled ?? true;
  useEffect(() => {
    const updateTimeLeft = () => {
      setTimeLeft(getTimeUntilLaunch(nextBadge.launchDate));
    };
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [nextBadge.launchDate]);
  const handleOptInToggle = async () => {
    if (!badgeData) {
      console.error('Badge data not found for opt-in. Configuration name:', nextBadge.name, 'Available badges:', badges.map(b => b.name));
      toast({
        title: "Badge not found",
        description: "Unable to find the badge in the database. Please try again later.",
        variant: "destructive"
      });
      return;
    }
    try {
      if (isUserOptedIn) {
        await optOutOfBadge(badgeData.id);
      } else {
        await optInToBadge(badgeData.id);
      }
    } catch (error) {
      console.error('Opt-in toggle failed:', error);
      toast({
        title: "Something went wrong",
        description: "Failed to update your opt-in status. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleNotificationToggle = async (enabled: boolean) => {
    if (!badgeData) return;
    await updateNotificationPreference(badgeData.id, enabled);
  };
  return <Card className="border-palette-accent-blue/20 bg-gradient-to-br from-palette-accent-blue/5 to-palette-accent-purple/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-palette-accent-blue/10 text-palette-accent-blue">
              <img src={StartSvg} alt="Compass Badge" className="h-14 w-14" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-heading-md font-sans text-semantic-text-primary">
                Back to School Badge
              </CardTitle>
              <CardDescription className="text-body-sm text-semantic-text-secondary">
                Available {nextBadge.estimatedRelease}
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-palette-accent-blue/10 text-palette-accent-blue">
              <img src={FullSvg} alt="Compass Badge Full" className="h-14 w-14" />
            </div>
          </div>
          <Badge variant="secondary" className="bg-palette-accent-blue/10 text-palette-accent-blue border-palette-accent-blue/20">Up Next</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-body-md text-semantic-text-secondary leading-relaxed">
          Complete all four back to school sessions to earn the badge.
        </p>

        {/* Countdown Timer */}
        {timeLeft && <div className="bg-semantic-bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-palette-accent-blue" />
              <span className="font-medium text-semantic-text-primary text-body-sm">Launch Countdown</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-heading-lg font-bold text-palette-accent-blue">{timeLeft.days}</div>
                <div className="text-body-xs text-semantic-text-secondary">Days</div>
              </div>
              <div>
                <div className="text-heading-lg font-bold text-palette-accent-blue">{timeLeft.hours}</div>
                <div className="text-body-xs text-semantic-text-secondary">Hours</div>
              </div>
              <div>
                <div className="text-heading-lg font-bold text-palette-accent-blue">{timeLeft.minutes}</div>
                <div className="text-body-xs text-semantic-text-secondary">Minutes</div>
              </div>
            </div>
          </div>}

        {/* Badge Features */}
        <div>
          <h4 className="font-medium text-semantic-text-primary text-body-md mb-3">What we'll do together:</h4>
          <ul className="space-y-2">
            {displayData.features.map((feature, index) => <li key={index} className="flex items-center gap-2 text-body-sm text-semantic-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-palette-accent-blue flex-shrink-0"></div>
                {feature}
              </li>)}
          </ul>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-body-sm text-semantic-text-secondary">
          <Calendar className="h-4 w-4" />
          <span>Estimated completion: {displayData.estimatedDuration}</span>
        </div>

        {/* Opt-in Section */}
        <div className="border-t border-semantic-border-primary pt-6">
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium text-semantic-text-primary text-body-md mb-2">Enroll now and we'll start September 2nd</h4>
              <p className="text-body-sm text-semantic-text-secondary">We'll keep you in the know between now and then.</p>
            </div>
            
            <div className="flex justify-center">
              <ConsolidatedOptInButton isOptedIn={isUserOptedIn} onToggle={handleOptInToggle} size="lg" variant="brand" badgeName={nextBadge?.name || 'back to school badge'} />
            </div>
          </div>

          {/* Notification preferences */}
          {isUserOptedIn && <div className="flex items-center justify-between p-3 bg-semantic-bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2">
                {notificationsEnabled ? <Bell className="h-4 w-4 text-palette-accent-blue" /> : <BellOff className="h-4 w-4 text-semantic-text-tertiary" />}
                <span className="text-body-sm text-semantic-text-secondary">
                  Email notifications
                </span>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
            </div>}
        </div>
      </CardContent>
    </Card>;
};