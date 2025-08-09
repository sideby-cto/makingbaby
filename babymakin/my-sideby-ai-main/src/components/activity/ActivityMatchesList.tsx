import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Heart, X, MessageCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { useActivityMatches, useCreateActivityMatch, useUpdateActivityMatchStatus } from '@/hooks/useActivityMatching';
import { MatchSuggestion } from '@/services/activity/ActivityBasedMatchingService';

const getCompatibilityColor = (score: number) => {
  if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-orange-100 text-orange-800 border-orange-200';
};

const getCompatibilityLabel = (score: number) => {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Good Match';
  if (score >= 60) return 'Fair Match';
  return 'Potential Match';
};

const MatchCard: React.FC<{
  match: MatchSuggestion;
  onConnect: (userId: string) => void;
  isConnecting: boolean;
}> = ({ match, onConnect, isConnecting }) => {
  const { user, compatibility_score, match_reasoning } = match;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold truncate">
                {user.first_name} {user.last_name}
              </h3>
              <Badge className={getCompatibilityColor(compatibility_score)}>
                {compatibility_score}% Match
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {getCompatibilityLabel(compatibility_score)}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Activity Score: {user.activity_score}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Difference: {match_reasoning.score_difference}
              </div>
            </div>
            
            {match_reasoning.shared_interests && match_reasoning.shared_interests.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium mb-1">Shared Interests:</p>
                <div className="flex flex-wrap gap-1">
                  {match_reasoning.shared_interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Button
              onClick={() => onConnect(user.id)}
              disabled={isConnecting}
              size="sm"
              className="w-full"
            >
              {isConnecting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              Connect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ActivityMatchesList: React.FC = () => {
  const { data: matches, isLoading, error, refetch } = useActivityMatches();
  const createMatch = useCreateActivityMatch();

  const handleConnect = async (targetUserId: string) => {
    try {
      await createMatch.mutateAsync(targetUserId);
      // Refetch matches to update the list
      refetch();
    } catch (error) {
      console.error('Error connecting with user:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Activity-Based Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Activity-Based Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Unable to load matches. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Activity-Based Matches
          </CardTitle>
          <CardDescription>
            Connect with users who have similar activity levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No activity-based matches found yet. Keep engaging with the platform to improve your activity score and find better matches!
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Matches
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Activity-Based Matches
            </CardTitle>
            <CardDescription>
              {matches.length} potential match{matches.length !== 1 ? 'es' : ''} found based on activity levels
            </CardDescription>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.user.id}
              match={match}
              onConnect={handleConnect}
              isConnecting={createMatch.isPending}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};