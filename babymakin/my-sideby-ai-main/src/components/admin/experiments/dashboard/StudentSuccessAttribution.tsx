import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, TrendingUp, Users, Star, 
  Brain, Target, CheckCircle, AlertCircle 
} from 'lucide-react';

interface StudentSuccessAttributionProps {
  timeframe: string;
  experimentType: string;
}

export const StudentSuccessAttribution: React.FC<StudentSuccessAttributionProps> = ({
  timeframe,
  experimentType
}) => {
  const [activeAttributionTab, setActiveAttributionTab] = useState("patterns");

  // Mock data for success attribution
  const successMetrics = {
    overallSuccessRate: 87.3,
    attributedToExperiments: 72.1,
    improvements: [
      {
        metric: 'Learning Engagement',
        baseline: 68.2,
        experimental: 84.7,
        improvement: 16.5,
        significance: 'high'
      },
      {
        metric: 'Knowledge Retention',
        baseline: 74.1,
        experimental: 89.3,
        improvement: 15.2,
        significance: 'high'
      },
      {
        metric: 'Collaboration Quality',
        baseline: 71.5,
        experimental: 83.8,
        improvement: 12.3,
        significance: 'medium'
      }
    ]
  };

  const successPatterns = [
    {
      id: '1',
      pattern: 'Personalized Learning Paths',
      experiments: 12,
      participants: 234,
      successRate: 92.1,
      impact: 'High',
      description: 'Students with personalized learning paths show significantly higher engagement'
    },
    {
      id: '2',
      pattern: 'Collaborative Problem Solving',
      experiments: 8,
      participants: 156,
      successRate: 88.7,
      impact: 'Medium',
      description: 'Group-based learning activities increase retention and understanding'
    },
    {
      id: '3',
      pattern: 'Real-time Feedback Loops',
      experiments: 15,
      participants: 298,
      successRate: 91.4,
      impact: 'High',
      description: 'Immediate feedback mechanisms improve learning outcomes'
    }
  ];

  const attributionFactors = [
    { factor: 'Teaching Method Innovation', weight: 35, confidence: 94 },
    { factor: 'Student Engagement Techniques', weight: 28, confidence: 89 },
    { factor: 'Technology Integration', weight: 22, confidence: 85 },
    { factor: 'Assessment Strategy', weight: 15, confidence: 78 }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-semantic-success';
      case 'medium': return 'bg-semantic-warning';
      case 'low': return 'bg-semantic-muted';
      default: return 'bg-semantic-primary';
    }
  };

  const getSignificanceIcon = (significance: string) => {
    switch (significance) {
      case 'high': return <CheckCircle className="h-4 w-4 text-semantic-success" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-semantic-warning" />;
      default: return <AlertCircle className="h-4 w-4 text-semantic-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Attribution Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Overall Success Rate
            </CardTitle>
            <Award className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {successMetrics.overallSuccessRate}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Across all experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Attributed to Experiments
            </CardTitle>
            <Target className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {successMetrics.attributedToExperiments}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              Direct experimental impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Success Patterns
            </CardTitle>
            <Brain className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {successPatterns.length}
            </div>
            <p className="text-xs text-semantic-text-muted">
              Identified patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              High Impact Factors
            </CardTitle>
            <Star className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {attributionFactors.filter(f => f.weight > 25).length}
            </div>
            <p className="text-xs text-semantic-text-muted">
              Major contributors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Attribution Analysis */}
      <Tabs value={activeAttributionTab} onValueChange={setActiveAttributionTab}>
        <TabsList>
          <TabsTrigger value="patterns">Success Patterns</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="factors">Attribution Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-semantic-text-primary">
                Identified Success Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successPatterns.map((pattern) => (
                  <div key={pattern.id} className="p-4 border border-semantic-border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-semantic-text-primary">
                            {pattern.pattern}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`${getImpactColor(pattern.impact)} text-white`}
                          >
                            {pattern.impact} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-semantic-text-secondary">
                          {pattern.description}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-semantic-text-primary font-medium">
                          {pattern.successRate}% success
                        </div>
                        <div className="text-semantic-text-muted">
                          {pattern.participants} participants
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-semantic-text-secondary">Experiments: </span>
                        <span className="text-semantic-text-primary font-medium">
                          {pattern.experiments}
                        </span>
                      </div>
                      <div>
                        <span className="text-semantic-text-secondary">Participants: </span>
                        <span className="text-semantic-text-primary font-medium">
                          {pattern.participants}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Progress value={pattern.successRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-semantic-text-primary">
                Measured Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successMetrics.improvements.map((improvement, index) => (
                  <div key={index} className="p-4 border border-semantic-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-semantic-text-primary">
                          {improvement.metric}
                        </h3>
                        {getSignificanceIcon(improvement.significance)}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-semantic-success">
                          +{improvement.improvement}%
                        </div>
                        <div className="text-xs text-semantic-text-muted">
                          improvement
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-semantic-text-secondary">Baseline: </span>
                        <span className="text-semantic-text-primary font-medium">
                          {improvement.baseline}%
                        </span>
                      </div>
                      <div>
                        <span className="text-semantic-text-secondary">Experimental: </span>
                        <span className="text-semantic-text-primary font-medium">
                          {improvement.experimental}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="text-xs text-semantic-text-muted">Baseline</div>
                      <Progress value={improvement.baseline} className="h-2" />
                      <div className="text-xs text-semantic-text-muted">Experimental</div>
                      <Progress value={improvement.experimental} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-semantic-text-primary">
                Attribution Factor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attributionFactors.map((factor, index) => (
                  <div key={index} className="p-4 border border-semantic-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-semantic-text-primary">
                        {factor.factor}
                      </h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-semantic-text-primary">
                          {factor.weight}%
                        </div>
                        <div className="text-xs text-semantic-text-muted">
                          attribution weight
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-semantic-text-secondary">Confidence Level</span>
                        <span className="text-semantic-text-primary font-medium">
                          {factor.confidence}%
                        </span>
                      </div>
                      <Progress value={factor.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};