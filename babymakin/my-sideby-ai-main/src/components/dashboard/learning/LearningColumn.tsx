import React from "react";
import { ComingSoonBadge } from "./ComingSoonBadge";
import { CurrentProgressSection } from "./CurrentProgressSection";
import { FutureBadgesPreview } from "./FutureBadgesPreview";
import { isBackToSchoolLaunched, getNextUpcomingBadge } from "@/utils/badgeLaunchConfig";
import { Star, Users } from "lucide-react";
interface LearningColumnProps {
  userId: string | null;
}
export const LearningColumn: React.FC<LearningColumnProps> = ({
  userId
}) => {
  return <div className="space-y-8">
      {/* Earn Badges Header */}
      <div className="bg-gradient-to-r from-classroom-surface via-classroom-cream to-classroom-surface rounded-xl p-6 border border-classroom-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-classroom-text-primary mb-1">Your Learning Journey</h2>
            <p className="text-body-sm text-classroom-text-secondary">
              Curated learning paths designed by our team
            </p>
          </div>
        </div>
        
        <p className="text-body-md text-classroom-text-secondary leading-relaxed mb-6">
          Carefully curated learning experiences that combine our team's expertise in teaching and learning and the ideas that truly make AI fly for educators. Each badge represents a complete learning journey designed to help you grow professionally.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-palette-accent-blue/10 text-palette-accent-blue mt-1">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-classroom-text-primary text-body-md">Expert Curation</h4>
              <p className="text-body-sm text-classroom-text-secondary">
                Each badge is thoughtfully designed by our team to deliver maximum value
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-palette-accent-purple/10 text-palette-accent-purple mt-1">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-classroom-text-primary text-body-md">Community Benefits</h4>
              <p className="text-body-sm text-classroom-text-secondary">
                Knowledge that strengthens the entire sideby community
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Coming Soon Badge - only show if there's an upcoming badge */}
      {getNextUpcomingBadge() && <ComingSoonBadge userId={userId} />}
      
      {/* Current Progress */}
      <CurrentProgressSection userId={userId} />
      
      {/* Future Badges Preview */}
      <FutureBadgesPreview />
    </div>;
};