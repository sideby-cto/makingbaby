
import React from "react";
import { Star, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LightningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    viewBox="0 0 250 250" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <style>
        {`.cls-1 {
          fill: none;
          stroke: #1a40f4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 11px;
        }
        .cls-2 {
          fill: #f99eb3;
        }`}
      </style>
    </defs>
    <polygon className="cls-2" points="75.43 132.26 128.89 132.26 101.23 225.12 174.57 105.08 125.71 106.12 166.99 24.88 75.43 132.26"/>
    <polygon className="cls-1" points="75.43 132.26 128.89 132.26 101.23 225.12 174.57 105.08 125.71 106.12 166.99 24.88 75.43 132.26"/>
  </svg>
);

export const BadgeSystemIntroduction: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-semantic-bg-secondary/50 to-semantic-bg-accent/30 border-semantic-border-primary">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-palette-highlighter-yellow/10 text-palette-highlighter-yellow">
            <LightningIcon className="h-14 w-14" />
          </div>
          <div>
            <CardTitle className="text-heading-md font-sans text-semantic-text-primary">
              Welcome to sideby Badges
            </CardTitle>
            <CardDescription className="text-body-sm text-semantic-text-secondary">
              Curated learning paths designed by our team
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-body-md text-semantic-text-secondary leading-relaxed">
          Our badge system features carefully curated learning experiences that combine the best insights 
          from education research with practical tools you can use immediately. Each badge represents 
          a complete learning journey designed to help you grow professionally.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-palette-accent-blue/10 text-palette-accent-blue mt-1">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-semantic-text-primary text-body-md">Expert Curation</h4>
              <p className="text-body-sm text-semantic-text-secondary">
                Each badge is thoughtfully designed by our team to deliver maximum value
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-palette-accent-purple/10 text-palette-accent-purple mt-1">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-semantic-text-primary text-body-md">Community Benefits</h4>
              <p className="text-body-sm text-semantic-text-secondary">
                Knowledge that strengthens the entire sideby community
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
