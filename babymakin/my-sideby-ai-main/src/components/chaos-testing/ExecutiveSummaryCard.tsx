import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExecutiveSummary } from '@/types/chaos-testing';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Shield,
  Gauge,
  Monitor,
  Zap
} from 'lucide-react';

interface ExecutiveSummaryCardProps {
  summary: ExecutiveSummary;
}

export const ExecutiveSummaryCard = ({ summary }: ExecutiveSummaryCardProps) => {
  const getHealthIcon = (health: ExecutiveSummary['overallHealth']) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'concerning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
  };

  const getHealthColor = (health: ExecutiveSummary['overallHealth']) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'concerning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const getRiskColor = (risk: ExecutiveSummary['businessRiskLevel']) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getHealthIcon(summary.overallHealth)}
            <CardTitle>Executive Summary</CardTitle>
          </div>
          <Badge className={getRiskColor(summary.businessRiskLevel)}>
            {summary.businessRiskLevel.toUpperCase()} RISK
          </Badge>
        </div>
        <CardDescription>
          Overall application health and business impact assessment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <Monitor className="h-5 w-5 mx-auto text-blue-500" />
            <div className="text-2xl font-bold">{summary.keyMetrics.stabilityScore}</div>
            <div className="text-xs text-muted-foreground">Stability Score</div>
            <Progress value={summary.keyMetrics.stabilityScore} className="h-2" />
          </div>
          
          <div className="text-center space-y-2">
            <Users className="h-5 w-5 mx-auto text-purple-500" />
            <div className="text-2xl font-bold">{summary.keyMetrics.usabilityScore}</div>
            <div className="text-xs text-muted-foreground">Usability Score</div>
            <Progress value={summary.keyMetrics.usabilityScore} className="h-2" />
          </div>
          
          <div className="text-center space-y-2">
            <Shield className="h-5 w-5 mx-auto text-green-500" />
            <div className="text-2xl font-bold">{summary.keyMetrics.securityScore}</div>
            <div className="text-xs text-muted-foreground">Security Score</div>
            <Progress value={summary.keyMetrics.securityScore} className="h-2" />
          </div>
          
          <div className="text-center space-y-2">
            <Zap className="h-5 w-5 mx-auto text-orange-500" />
            <div className="text-2xl font-bold">{summary.keyMetrics.performanceScore}</div>
            <div className="text-xs text-muted-foreground">Performance Score</div>
            <Progress value={summary.keyMetrics.performanceScore} className="h-2" />
          </div>
        </div>

        {/* Critical Issues Alert */}
        {summary.criticalIssuesCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {summary.criticalIssuesCount} Critical Issue{summary.criticalIssuesCount > 1 ? 's' : ''} Require Immediate Attention
              </span>
            </div>
          </div>
        )}

        {/* User Impact */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">User Impact Score</span>
            <span className="text-2xl font-bold">{summary.userImpactScore}/10</span>
          </div>
          <Progress value={summary.userImpactScore * 10} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            How well the application serves user needs and expectations
          </p>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium mb-3">Top Recommendations</h4>
          <div className="space-y-2">
            {summary.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                  {index + 1}
                </div>
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};