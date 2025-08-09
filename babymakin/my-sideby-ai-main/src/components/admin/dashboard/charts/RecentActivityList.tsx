
import React from 'react';
import { format } from "date-fns";
import { UserPlus, UserCheck, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ActivityData {
  id: string;
  type: 'match_created' | 'match_completed' | 'member_joined';
  created_at: string;
  metadata?: {
    user_name?: string;
    partner_name?: string;
  };
}

interface RecentActivityListProps {
  activities?: ActivityData[];
  transcripts?: any[];
}

export const RecentActivityList = ({ activities, transcripts }: RecentActivityListProps) => {
  // If we have the old transcript data, just return null
  if (transcripts) {
    return null;
  }

  if (!activities || activities.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No recent activity</p>;
  }

  // Only show latest 5 activities
  const recent = activities.slice(0, 5);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
      <div className="space-y-2">
        {recent.map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 py-2">
            {activity.type === 'match_created' && (
              <Users className="h-4 w-4 text-purple-500 mt-0.5" />
            )}
            {activity.type === 'match_completed' && (
              <UserCheck className="h-4 w-4 text-green-500 mt-0.5" />
            )}
            {activity.type === 'member_joined' && (
              <UserPlus className="h-4 w-4 text-amber-500 mt-0.5" />
            )}
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">
                  {activity.type === 'match_created' && 'Match created'}
                  {activity.type === 'match_completed' && 'Match completed'}
                  {activity.type === 'member_joined' && 'New member joined'}
                </p>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                {activity.type === 'match_created' && activity.metadata?.user_name && activity.metadata?.partner_name && 
                  `${activity.metadata.user_name} matched with ${activity.metadata.partner_name}`
                }
                {activity.type === 'match_completed' && activity.metadata?.user_name && activity.metadata?.partner_name && 
                  `${activity.metadata.user_name} completed session with ${activity.metadata.partner_name}`
                }
                {activity.type === 'member_joined' && activity.metadata?.user_name && 
                  `${activity.metadata.user_name} joined sideby`
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
