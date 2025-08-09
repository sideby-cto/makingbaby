
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Match } from "./types/matches";
import { UserInfo } from "./components/UserInfo";
import { MatchActions } from "./MatchActions";
import { UserAvailability } from "./UserAvailability";
import { MatchMessageList } from "./MatchMessageList";
import { TouchpointAnalysis } from "./TouchpointAnalysis";
import { CalendarClock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MatchCardProps {
  match: Match;
  onUpdate: () => void;
  onClose: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onUpdate, onClose }) => {
  const getStatusBadge = () => {
    switch (match.status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case "deleted":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Deleted</Badge>;
      default:
        return <Badge variant="outline">{match.status}</Badge>;
    }
  };

  const getReflectionBadge = (user: Match['user1'] | Match['user2']) => {
    if (!user) return null;
    
    return user.has_completed_reflection ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Reflection Done
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <XCircle className="h-3 w-3 mr-1" />
        No Reflection
      </Badge>
    );
  };

  const renderFlowActivity = (flowActivity: string | null) => {
    if (!flowActivity) return null;
    
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        Flow: {flowActivity}
      </Badge>
    );
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-0 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-semibold">Match Details</DialogTitle>
            {getStatusBadge()}
          </div>
          <div>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <CalendarClock className="h-3 w-3 mr-1" />
              {new Date(match.created_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </DialogHeader>

      <Tabs defaultValue="messages" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="px-6 pt-4 flex justify-start space-x-2 bg-transparent h-auto border-b rounded-none">
          <TabsTrigger value="details" className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary">Details</TabsTrigger>
          <TabsTrigger value="availability" className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary">Availability</TabsTrigger>
          <TabsTrigger value="messages" className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary">Messages</TabsTrigger>
          <TabsTrigger value="touchpoints" className="rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary">Touchpoints</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="details" className="h-full overflow-auto mt-0 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">User 1</h4>
                <div className="space-y-4">
                  <div className="font-medium text-purple-600">{match.user1?.first_name} {match.user1?.last_name}</div>
                  <div className="text-sm text-gray-500">{match.user1?.email || 'No email available'}</div>
                  
                  <div className="flex flex-wrap gap-2">
                    {getReflectionBadge(match.user1)}
                    {renderFlowActivity(match.user1?.primary_flow_activity)}
                    {match.user1?.pacing && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Pace: {match.user1.pacing.level}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Teaching Experience:</h5>
                    <p>{match.user1?.teaching_experience || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">User 2</h4>
                <div className="space-y-4">
                  <div className="font-medium text-purple-600">{match.user2?.first_name} {match.user2?.last_name}</div>
                  <div className="text-sm text-gray-500">{match.user2?.email || 'No email available'}</div>
                  
                  <div className="flex flex-wrap gap-2">
                    {getReflectionBadge(match.user2)}
                    {renderFlowActivity(match.user2?.primary_flow_activity)}
                    {match.user2?.pacing && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Pace: {match.user2.pacing.level}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Teaching Experience:</h5>
                    <p>{match.user2?.teaching_experience || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Match Rationale</h4>
              <div className="p-3 bg-gray-50 rounded-md">
                {match.rationale}
              </div>
            </div>

            {/* Always show the MatchActions component, the individual sections handle their own display logic */}
            <MatchActions match={match} onActionCompleted={onUpdate} />
          </TabsContent>

          <TabsContent value="availability" className="h-full overflow-auto mt-0 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{match.user1?.first_name}'s Availability</h4>
                <UserAvailability userId={match.user1?.id} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{match.user2?.first_name}'s Availability</h4>
                <UserAvailability userId={match.user2?.id} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="h-full overflow-auto mt-0 p-6">
            <MatchMessageList match={match} />
          </TabsContent>

          <TabsContent value="touchpoints" className="h-full overflow-auto mt-0 p-6">
            <TouchpointAnalysis match={match} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};
