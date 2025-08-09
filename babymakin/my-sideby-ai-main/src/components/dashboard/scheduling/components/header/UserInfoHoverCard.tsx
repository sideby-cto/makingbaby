
import React from "react";
import {
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserBadges } from "./UserBadges";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Users, MapPin } from "lucide-react";

export interface PartnerInfo {
  id?: string;
  name: string;
  avatar_url?: string | null;
  bio?: string | null;
  teaching_experience?: string | null;
  approved_stance?: string | null;
  subject_statuses?: { name: string; status: string }[] | null;
  primary_flow_activity?: string | null;
  location?: string | null; // Add location field
  pacing?: {
    level: string;
    community_name: string;
    community_id: string;
  } | null;
  crew?: {
    id: string;
    name: string;
  } | null;
}

interface UserInfoHoverCardProps {
  partnerInfo: PartnerInfo;
  getInitials: () => string;
}

export const UserInfoHoverCard = ({ 
  partnerInfo, 
  getInitials 
}: UserInfoHoverCardProps) => {
  return (
    <HoverCardContent className="w-80">
      <div className="flex justify-between space-x-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={partnerInfo.avatar_url || ''} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="space-y-1 flex-1 min-w-0">
          <h4 className="text-sm font-semibold break-words leading-tight">
            {partnerInfo.name || 'Partner'}
          </h4>
          
          {partnerInfo.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="break-words">{partnerInfo.location}</span>
            </div>
          )}
          
          <UserBadges 
            approvedStance={partnerInfo.approved_stance} 
            subjectStatuses={partnerInfo.subject_statuses}
          />
          
          {/* Flow Activity & Pacing Badges */}
          <div className="flex flex-wrap gap-1 mt-1">
            {partnerInfo.primary_flow_activity && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 flex-shrink-0">
                <Activity className="h-3 w-3" />
                <span className="break-words">{partnerInfo.primary_flow_activity}</span>
              </Badge>
            )}
            {partnerInfo.pacing && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span>{partnerInfo.pacing.level}</span>
              </Badge>
            )}
            {partnerInfo.crew && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 flex-shrink-0">
                <Users className="h-3 w-3" />
                <span>Crew</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {partnerInfo.bio && (
        <div className="mt-4">
          <h5 className="text-xs font-medium mb-1">Bio</h5>
          <p className="text-xs text-muted-foreground break-words leading-relaxed">
            {partnerInfo.bio}
          </p>
        </div>
      )}
      
      {partnerInfo.teaching_experience && (
        <div className="mt-2">
          <h5 className="text-xs font-medium mb-1">Teaching Experience</h5>
          <p className="text-xs text-muted-foreground break-words leading-relaxed">
            {partnerInfo.teaching_experience}
          </p>
        </div>
      )}
    </HoverCardContent>
  );
};
