import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TestError } from '@/types/chaos-testing';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckSquare, 
  Target,
  User,
  Heart,
  ArrowRight
} from 'lucide-react';

interface BusinessIssueCardProps {
  error: TestError;
}

export const BusinessIssueCard = ({ error }: BusinessIssueCardProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'significant': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      case 'minimal': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user-experience': return <User className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      case 'performance': return <Target className="h-4 w-4" />;
      default: return <CheckSquare className="h-4 w-4" />;
    }
  };

  if (!error.businessImpact) {
    return null; // Don't render if no business translation available
  }

  return (
    <Card className="border-l-4" style={{ 
      borderLeftColor: error.businessImpact.severity === 'critical' ? '#ef4444' :
                      error.businessImpact.severity === 'significant' ? '#f97316' :
                      error.businessImpact.severity === 'moderate' ? '#eab308' : '#3b82f6'
    }}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {getCategoryIcon(error.category || 'general')}
            <Badge className={getSeverityColor(error.businessImpact.severity)}>
              {error.businessImpact.severity.toUpperCase()} IMPACT
            </Badge>
            <Badge variant="outline" className={getPriorityColor(error.priority || 'medium')}>
              {(error.priority || 'medium').toUpperCase()} PRIORITY
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {error.timestamp.toLocaleTimeString()}
          </div>
        </div>

        {/* Business Impact */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-lg mb-2">Business Impact</h4>
            <p className="text-muted-foreground">{error.businessImpact.businessConsequences}</p>
          </div>

          <div>
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Experience
            </h5>
            <p className="text-sm text-muted-foreground">{error.businessImpact.userExperience}</p>
          </div>

          {/* Affected Features */}
          {error.businessImpact.affectedFeatures.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Affected Features</h5>
              <div className="flex flex-wrap gap-1">
                {error.businessImpact.affectedFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* User Story */}
        {error.userStory && (
          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              User Story
            </h5>
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <p className="text-sm">
                <span className="font-medium">As a {error.userStory.persona}:</span> {error.userStory.scenario}
              </p>
              <p className="text-sm text-red-600">
                <span className="font-medium">Frustration:</span> {error.userStory.frustration}
              </p>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Action Items */}
        {error.suggestedActions && (
          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Recommended Actions
            </h5>
            
            {error.suggestedActions.immediate.length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-red-600 mb-1">🚨 Immediate</h6>
                <ul className="text-sm space-y-1">
                  {error.suggestedActions.immediate.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-red-500" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error.suggestedActions.shortTerm.length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-orange-600 mb-1">📅 Short Term</h6>
                <ul className="text-sm space-y-1">
                  {error.suggestedActions.shortTerm.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-orange-500" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error.suggestedActions.longTerm.length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-blue-600 mb-1">🎯 Long Term</h6>
                <ul className="text-sm space-y-1">
                  {error.suggestedActions.longTerm.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-blue-500" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Separator className="my-4" />

        {/* Stakeholders */}
        {error.stakeholders && (
          <div className="space-y-2">
            <h5 className="font-medium">Stakeholders & Ownership</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Primary Owner:</span>
                <p>{error.stakeholders.primaryOwner}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Affected Teams:</span>
                <p>{error.stakeholders.affectedTeams.join(', ')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Estimated Effort:</span>
                <p>{error.estimatedEffort}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};