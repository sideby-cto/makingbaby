
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, RefreshCw, Calendar } from "lucide-react";
import { UPCOMING_BADGES as BADGE_CONFIG } from "@/utils/badgeLaunchConfig";

const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    viewBox="0 0 250 250" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>
        {`.cls-1 {
          fill: #f99eb3;
          isolation: isolate;
        }
        .cls-2 {
          fill: none;
          stroke: #1a40f4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 11px;
        }`}
      </style>
    </defs>
    <rect className="cls-1" x="125" y="61" width="88" height="128"/>
    <line className="cls-2" x1="125" y1="125" x2="213" y2="125"/>
    <line className="cls-2" x1="125" y1="61" x2="213" y2="61"/>
    <line className="cls-2" x1="125" y1="189" x2="213" y2="189"/>
    <polyline className="cls-2" points="37 61 53 77 85 45"/>
    <polyline className="cls-2" points="37 125 53 141 85 109"/>
    <polyline className="cls-2" points="37 189 53 205 85 173"/>
  </svg>
);

// Map badge IDs to icons and colors
const BADGE_DISPLAY_CONFIG = {
  "ai-resolutions": { icon: Target, color: "palette-accent-blue" },
  "back-to-school": { icon: Calendar, color: "palette-accent-purple" },
  "ai-onward": { icon: ArrowRight, color: "palette-accent-orange" },
  "ai-refresh": { icon: RefreshCw, color: "palette-accent-green" }
};

// Create display badges with icons and colors, sorted chronologically
const UPCOMING_BADGES = BADGE_CONFIG
  .filter(badge => badge.id !== "back-to-school") // Exclude back-to-school since it's handled separately
  .sort((a, b) => a.launchDate.getTime() - b.launchDate.getTime())
  .map(badge => ({
    ...badge,
    icon: BADGE_DISPLAY_CONFIG[badge.id as keyof typeof BADGE_DISPLAY_CONFIG]?.icon || Target,
    color: BADGE_DISPLAY_CONFIG[badge.id as keyof typeof BADGE_DISPLAY_CONFIG]?.color || "palette-accent-blue"
  }));

export const FutureBadgesPreview: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-palette-accent-purple/10 text-palette-accent-purple">
            <ListIcon className="h-10 w-10" />
          </div>
          <div>
            <CardTitle className="text-heading-md font-sans text-semantic-text-primary">
              Coming Soon
            </CardTitle>
            <CardDescription className="text-body-sm text-semantic-text-secondary">
              More curated learning experiences in development
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-body-md text-semantic-text-secondary mb-6">
          We're continuously developing new badge experiences. Here's what's coming next:
        </p>
        
        <div className="space-y-4">
          {UPCOMING_BADGES.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-semantic-border-secondary bg-semantic-bg-secondary/30 hover:bg-semantic-bg-secondary/50 transition-colors"
              >
                <div className={`p-2 rounded-lg bg-${badge.color}/10 text-${badge.color} flex-shrink-0`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-semantic-text-primary text-body-md truncate">
                      {badge.name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {badge.estimatedRelease}
                    </Badge>
                  </div>
                  <p className="text-body-sm text-semantic-text-secondary">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-palette-accent-blue/5 rounded-lg border border-palette-accent-blue/20">
          <p className="text-body-sm text-semantic-text-secondary">
            <strong className="text-semantic-text-primary">Have an idea for a badge?</strong> We'd love to hear from you! 
            Our team is always looking for ways to create learning experiences that truly serve the community.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
