
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Activity, Users, Clock } from "lucide-react";
import type { Profile } from "@/types/profile";

interface UserContextInfoProps {
  profile: Profile;
  matchCount?: number;
  lastActivity?: string;
  journeyStage?: string;
}

export const UserContextInfo = ({ 
  profile, 
  matchCount = 0, 
  lastActivity, 
  journeyStage 
}: UserContextInfoProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Quick Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Joined:</span>
            <span className="font-medium">{formatDate(profile.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Matches:</span>
            <Badge variant="outline" className="h-5 px-2 text-xs">
              {matchCount}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Stage:</span>
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {journeyStage || "Unknown"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Last Active:</span>
            <span className="font-medium text-xs">{lastActivity || "Unknown"}</span>
          </div>
        </div>

        {profile.pacing && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Pacing:</span>
              <Badge variant="outline" className="h-5 px-2 text-xs">
                {profile.pacing.level}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Community:</span>
              <span className="text-xs font-medium">{profile.pacing.community_name}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
