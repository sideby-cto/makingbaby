import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, Lightbulb, Users, Target, Zap } from "lucide-react";

interface PredictiveInsightsViewProps {
  analytics: any;
  loading: boolean;
  timeRange: string;
}

export const PredictiveInsightsView: React.FC<PredictiveInsightsViewProps> = ({
  analytics,
  loading,
  timeRange
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const atRiskUsers = analytics?.atRiskUsers || [];
  const predictions = analytics?.growthPredictions || [];
  const recommendations = analytics?.recommendations || [];

  const getRiskColor = (score: number) => {
    if (score >= 70) return "destructive";
    if (score >= 40) return "secondary";
    return "default";
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 20) return "hsl(var(--primary))";
    if (impact >= 10) return "hsl(var(--secondary))";
    return "hsl(var(--muted))";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* At-Risk Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-semantic-text-primary">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            At-Risk Users
          </CardTitle>
          <p className="text-sm text-semantic-text-secondary">
            Users with high probability of disengaging or dropping out
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atRiskUsers.map((user) => (
              <div 
                key={user.userId} 
                className="flex items-center justify-between p-4 bg-semantic-background rounded-lg border border-semantic-border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-semantic-text-primary">
                      {user.name}
                    </h4>
                    <Badge variant={getRiskColor(user.riskScore)}>
                      Risk Score: {user.riskScore}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.reasons.map((reason, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-semantic-border rounded text-xs text-semantic-text-secondary"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Send Message
                  </Button>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
            
            {atRiskUsers.length === 0 && (
              <div className="text-center py-8 text-semantic-text-secondary">
                <Users className="h-12 w-12 mx-auto mb-4 text-semantic-text-muted" />
                <p>No at-risk users identified at this time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-semantic-text-primary">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Growth Predictions
          </CardTitle>
          <p className="text-sm text-semantic-text-secondary">
            Projected changes in key metrics based on current trends
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predictions.map((prediction) => (
              <div 
                key={prediction.metric}
                className="p-4 bg-semantic-background rounded-lg border border-semantic-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-semantic-text-primary">
                    {prediction.metric}
                  </h4>
                  <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}% confidence
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-semantic-text-secondary">Current:</span>
                    <span className="font-medium text-semantic-text-primary">
                      {prediction.current}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-semantic-text-secondary">Predicted:</span>
                    <span className="font-medium text-semantic-text-primary">
                      {prediction.predicted}
                    </span>
                  </div>
                  <Progress 
                    value={(prediction.predicted / prediction.current) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-center text-semantic-text-muted">
                    {((prediction.predicted - prediction.current) / prediction.current * 100).toFixed(1)}% change expected
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-semantic-text-primary">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Strategic Recommendations
          </CardTitle>
          <p className="text-sm text-semantic-text-secondary">
            Data-driven suggestions to improve user engagement and learning outcomes
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className="p-4 bg-semantic-background rounded-lg border border-semantic-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {rec.type}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-semantic-text-muted" />
                        <span className="text-sm text-semantic-text-secondary">
                          Impact: {rec.impact}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-semantic-text-muted" />
                        <span className="text-sm text-semantic-text-secondary">
                          Effort: {rec.effort}%
                        </span>
                      </div>
                    </div>
                    <p className="text-semantic-text-primary">
                      {rec.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-semantic-text-secondary">Impact</span>
                      <div className="w-16 bg-semantic-border rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${rec.impact}%`,
                            backgroundColor: getImpactColor(rec.impact)
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-semantic-text-secondary">Effort</span>
                      <div className="w-16 bg-semantic-border rounded-full h-2">
                        <div 
                          className="bg-semantic-text-muted h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${rec.effort}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                    <Button size="sm">
                      Implement
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-semantic-text-primary">AI-Generated Insights</CardTitle>
          <p className="text-sm text-semantic-text-secondary">
            Key patterns and opportunities identified by our analytics engine
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-semantic-text-primary">Key Patterns</h4>
              <div className="space-y-2">
                <div className="p-3 bg-semantic-background rounded border border-semantic-border">
                  <p className="text-sm text-semantic-text-secondary">
                    Users who engage within the first 3 days have 85% higher retention rates
                  </p>
                </div>
                <div className="p-3 bg-semantic-background rounded border border-semantic-border">
                  <p className="text-sm text-semantic-text-secondary">
                    Peer interaction increases learning completion by 67%
                  </p>
                </div>
                <div className="p-3 bg-semantic-background rounded border border-semantic-border">
                  <p className="text-sm text-semantic-text-secondary">
                    Mobile users show 23% higher session frequency than desktop users
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-semantic-text-primary">Optimization Opportunities</h4>
              <div className="space-y-2">
                <div className="p-3 bg-semantic-background rounded border border-semantic-border">
                  <p className="text-sm text-semantic-text-secondary">
                    Streamline onboarding to reduce 48-hour drop-off by 30%
                  </p>
                </div>
                <div className="p-3 bg-semantic-background rounded border border-semantic-border">
                  <p className="text-sm text-semantic-text-secondary">
                    Implement smart matching to increase mentor-mentee success rates
                  </p>
                </div>
                <div className="p-3 bg-semantic-background rounded border border-semantic-border">
                  <p className="text-sm text-semantic-text-secondary">
                    Add progressive difficulty levels to maintain engagement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};