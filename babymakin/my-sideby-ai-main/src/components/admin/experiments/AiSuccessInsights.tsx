import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';
import { useSuccessPatternAnalysis } from '@/hooks/useAiSuccessAnalysis';
import { Skeleton } from '@/components/ui/skeleton';

interface AiSuccessInsightsProps {
  studentId: string;
  studentName: string;
}

export const AiSuccessInsights: React.FC<AiSuccessInsightsProps> = ({
  studentId,
  studentName
}) => {
  const [timeframe, setTimeframe] = useState('30');
  const { data: analysisData, isLoading, error, refetch } = useSuccessPatternAnalysis(studentId, timeframe);

  const patterns = analysisData?.patterns;
  const summary = analysisData?.data_summary;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Success Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Success Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load AI insights: {error.message}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Success Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No success signs found for analysis. Add some success signs first to see AI insights.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (value: number) => {
    if (value >= 4) return 'bg-green-500';
    if (value >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Success Insights - {studentName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-900">{summary?.total_signs || 0}</div>
            <div className="text-sm text-blue-700">Total Success Signs</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              {getTrendIcon(patterns.patterns.trend_direction)}
            </div>
            <div className="text-lg font-bold text-green-900 capitalize">
              {patterns.patterns.trend_direction}
            </div>
            <div className="text-sm text-green-700">Trend</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-900">
              {patterns.predictions.success_likelihood}/5
            </div>
            <div className="text-sm text-purple-700">Success Likelihood</div>
          </div>
        </div>

        <Tabs defaultValue="patterns" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success Sign Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(patterns.patterns.sign_distribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize text-sm font-medium">{type}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count as number / (summary?.total_signs || 1)) * 100} 
                          className="w-20 h-2"
                        />
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={patterns.patterns.average_confidence * 20} 
                        className="w-16 h-2"
                      />
                      <Badge variant="outline">
                        {patterns.patterns.average_confidence.toFixed(1)}/5
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Most Frequent Signs:</div>
                    <div className="flex flex-wrap gap-1">
                      {patterns.patterns.most_frequent_signs.map((sign) => (
                        <Badge key={sign} variant="default" className="text-xs">
                          {sign}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patterns.insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Growth Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patterns.insights.growth_areas.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Trajectory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={patterns.trajectory.overall_progress === 'excellent' ? 'default' : 
                               patterns.trajectory.overall_progress === 'good' ? 'secondary' : 'destructive'}
                      className="capitalize"
                    >
                      {patterns.trajectory.overall_progress}
                    </Badge>
                    <span className="text-sm text-gray-600">Overall Progress</span>
                  </div>
                  
                  {patterns.trajectory.growth_evidence.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Growth Evidence:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {patterns.trajectory.growth_evidence.map((evidence, index) => (
                          <li key={index}>{evidence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    Immediate Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patterns.recommendations.immediate_actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patterns.recommendations.strategies.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patterns.recommendations.focus_areas.map((area, index) => (
                    <Badge key={index} variant="outline" className="p-2">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success Prediction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {patterns.predictions.success_likelihood}/5
                    </div>
                    <Progress 
                      value={patterns.predictions.success_likelihood * 20} 
                      className="w-full h-3"
                    />
                    <p className="text-sm text-gray-600 mt-2">Success Likelihood</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patterns.predictions.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {patterns.predictions.risk_factors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Risk Factors to Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patterns.predictions.risk_factors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">AI Summary</h4>
          <p className="text-sm text-gray-700">{patterns.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
};