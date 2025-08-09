
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useMatches } from "@/hooks/useMatches";

interface MatchSectionProps {
  userId?: string | null;
}

export const MatchSection = ({ userId }: MatchSectionProps) => {
  const { matches, loading, error } = useMatches(userId);

  return (
    <Card className="border-[#FF5733]/20 shadow-md" data-testid="match-section-card">
      <CardHeader className="bg-gradient-to-r from-[#FFF0ED] to-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#FF5733] flex items-center gap-2" data-testid="match-section-title">
            <Users className="h-5 w-5" />
            Your Educator Matches
          </CardTitle>
          {matches && matches.length > 0 && (
            <Badge variant="secondary" className="bg-[#FF5733]/10 text-[#FF5733]" data-testid="match-count-badge">
              {matches.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4" data-testid="match-section-content">
        {loading ? (
          <div className="space-y-3" data-testid="match-loading-state">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8" data-testid="match-error-state">
            <p className="text-red-600 mb-4">Unable to load matches</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-3" data-testid="match-list">
            {matches.slice(0, 3).map((match) => {
              const partner = match.user1_id === userId ? match.user2 : match.user1;
              const partnerName = partner && partner.first_name 
                ? `${partner.first_name} ${partner.last_name || ''}`.trim()
                : 'Partner';

              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`match-item-${match.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#FF5733]/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#FF5733]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900" data-testid={`partner-name-${match.id}`}>
                        {partnerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Matched educator
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/match/${match.id}`}
                      data-testid={`chat-button-${match.id}`}
                    >
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            {matches.length > 3 && (
              <div className="text-center pt-2" data-testid="view-all-matches">
                <Link to="/matches">
                  <Button variant="ghost" size="sm">
                    View All Matches ({matches.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8" data-testid="no-matches-state">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No matches yet
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              We're working on finding the perfect educator matches for you. Check back soon!
            </p>
            <Button variant="outline" className="flex items-center gap-2" data-testid="find-matches-button">
              <Calendar className="h-4 w-4" />
              Find Matches
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
