
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Mail, Battery, Zap, Flame, Rocket } from "lucide-react";
import { UserJourney } from "./UserJourneyList";

interface UserJourneyDetailProps {
  userId: string;
  onBack: () => void;
  userJourney?: UserJourney;
  loading: boolean;
}

export const UserJourneyDetail = ({ userId, onBack, userJourney, loading }: UserJourneyDetailProps) => {
  if (loading || !userJourney) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>User Journey Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-20 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-40 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'new':
        return <Badge className="bg-gray-100 text-gray-800">New</Badge>;
      case 'introduced':
        return <Badge className="bg-blue-100 text-blue-800">Introduced</Badge>;
      case 'matched':
        return <Badge className="bg-yellow-100 text-yellow-800">Matched</Badge>;
      case 'scheduled':
        return <Badge className="bg-orange-100 text-orange-800">Scheduled</Badge>;
      case 'conversation':
        return <Badge className="bg-purple-100 text-purple-800">Had Session</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      default:
        return <Badge>{stage}</Badge>;
    }
  };

  const getPacingIcon = () => {
    if (!userJourney.pacingLevel) return null;
    
    switch (userJourney.pacingLevel) {
      case "light":
        return <Battery className="mr-2 h-4 w-4 text-blue-500" />;
      case "moderate":
        return <Zap className="mr-2 h-4 w-4 text-yellow-500" />;
      case "consistent":
        return <Flame className="mr-2 h-4 w-4 text-orange-500" />;
      case "deep_dive":
        return <Rocket className="mr-2 h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatPacingLabel = (pacing: string | undefined) => {
    if (!pacing) return "Not set";
    return pacing.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>{userJourney.firstName} {userJourney.lastName}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-2" /> Send Email
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" /> Create Match
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-base">{userJourney.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Journey Stage</h3>
                <div className="mt-1">{getStageBadge(userJourney.stage)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Learning Pace</h3>
                <div className="mt-1 flex items-center">
                  {getPacingIcon()}
                  <span>{formatPacingLabel(userJourney.pacingLevel)}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Active</h3>
                <p className="text-base">{userJourney.lastActive || 'Unknown'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Registration</h3>
                <p className="text-base">{userJourney.daysSinceRegistration} days ago</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Match Count</h3>
                <p className="text-base">{userJourney.matchCount}</p>
              </div>
            </div>
            
            {/* Journey Timeline - Placeholder for now */}
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Journey Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                    <div>
                      <p className="text-sm font-semibold">Joined sideby</p>
                      <p className="text-xs text-muted-foreground">{userJourney.daysSinceRegistration} days ago</p>
                    </div>
                  </div>
                  
                  {userJourney.stage !== 'new' && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                      <div>
                        <p className="text-sm font-semibold">Introduced themselves</p>
                        <p className="text-xs text-muted-foreground">Added first introduction</p>
                      </div>
                    </div>
                  )}
                  
                  {(userJourney.stage === 'matched' || userJourney.stage === 'scheduled' || 
                    userJourney.stage === 'conversation' || userJourney.stage === 'active') && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                      <div>
                        <p className="text-sm font-semibold">First match created</p>
                        <p className="text-xs text-muted-foreground">Matched with another educator</p>
                      </div>
                    </div>
                  )}
                  
                  {(userJourney.stage === 'scheduled' || userJourney.stage === 'conversation' || 
                    userJourney.stage === 'active') && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                      <div>
                        <p className="text-sm font-semibold">First session scheduled</p>
                        <p className="text-xs text-muted-foreground">Confirmed meeting time</p>
                      </div>
                    </div>
                  )}
                  
                  {(userJourney.stage === 'conversation' || userJourney.stage === 'active') && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                      <div>
                        <p className="text-sm font-semibold">First session completed</p>
                        <p className="text-xs text-muted-foreground">Completed a conversation</p>
                      </div>
                    </div>
                  )}
                  
                  {userJourney.stage === 'active' && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                      <div>
                        <p className="text-sm font-semibold">Became active user</p>
                        <p className="text-xs text-muted-foreground">Saved ideas and resources</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
