import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, LineChart, PieChart, TrendingUp, 
  Download, Maximize, Filter, Eye 
} from 'lucide-react';

interface DataVisualizationProps {
  timeframe: string;
  experimentType: string;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  timeframe,
  experimentType
}) => {
  const [selectedVisualization, setSelectedVisualization] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState("success_rate");

  // Mock data for charts
  const chartData = {
    successRates: [
      { experiment: 'Hat Detection A/B', control: 68.2, variant: 84.7, improvement: 16.5 },
      { experiment: 'Learning Focus Study', control: 74.1, variant: 89.3, improvement: 15.2 },
      { experiment: 'Stance Analysis Test', control: 71.5, variant: 83.8, improvement: 12.3 },
      { experiment: 'Teaching Method X', control: 79.3, variant: 87.1, improvement: 7.8 }
    ],
    participantDistribution: [
      { category: 'Elementary Teachers', count: 412, percentage: 34.2 },
      { category: 'Middle School Teachers', count: 356, percentage: 29.6 },
      { category: 'High School Teachers', count: 278, percentage: 23.1 },
      { category: 'Specialists', count: 158, percentage: 13.1 }
    ],
    timeSeriesData: [
      { month: 'Jan', experiments: 15, participants: 234, success: 78.5 },
      { month: 'Feb', experiments: 18, participants: 289, success: 81.2 },
      { month: 'Mar', experiments: 22, participants: 312, success: 83.7 },
      { month: 'Apr', experiments: 19, participants: 267, success: 85.1 },
      { month: 'May', experiments: 24, participants: 398, success: 87.3 }
    ]
  };

  const visualizationTypes = [
    { id: 'overview', label: 'Overview Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'trends', label: 'Trend Analysis', icon: <LineChart className="h-4 w-4" /> },
    { id: 'distribution', label: 'Distribution Charts', icon: <PieChart className="h-4 w-4" /> },
    { id: 'performance', label: 'Performance Metrics', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  const metricOptions = [
    { value: 'success_rate', label: 'Success Rate' },
    { value: 'participation', label: 'Participation Rate' },
    { value: 'engagement', label: 'Engagement Score' },
    { value: 'retention', label: 'Retention Rate' }
  ];

  return (
    <div className="space-y-6">
      {/* Visualization Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-semantic-text-primary">
              Data Visualization & Analytics
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedVisualization} onValueChange={setSelectedVisualization}>
            <TabsList className="grid w-full grid-cols-4">
              {visualizationTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                  {type.icon}
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Success Rate Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-semantic-text-primary">
                      Experiment Success Rate Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.successRates.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-semantic-text-secondary">{item.experiment}</span>
                            <Badge 
                              variant="secondary" 
                              className="bg-semantic-success text-white"
                            >
                              +{item.improvement}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-semantic-text-muted">Control</div>
                              <div className="h-2 bg-semantic-muted rounded-full">
                                <div 
                                  className="h-2 bg-semantic-primary rounded-full"
                                  style={{ width: `${item.control}%` }}
                                />
                              </div>
                              <div className="text-semantic-text-primary">{item.control}%</div>
                            </div>
                            <div>
                              <div className="text-semantic-text-muted">Variant</div>
                              <div className="h-2 bg-semantic-muted rounded-full">
                                <div 
                                  className="h-2 bg-semantic-success rounded-full"
                                  style={{ width: `${item.variant}%` }}
                                />
                              </div>
                              <div className="text-semantic-text-primary">{item.variant}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Participant Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-semantic-text-primary">
                      Participant Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chartData.participantDistribution.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-semantic-text-secondary">{item.category}</span>
                            <span className="text-semantic-text-primary font-medium">
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-semantic-muted rounded-full">
                            <div 
                              className="h-2 bg-semantic-primary rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium text-semantic-text-primary">
                    Experiment Trends Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Time Series Chart Placeholder */}
                    <div className="h-64 border border-semantic-border rounded-lg flex items-center justify-center bg-semantic-background-subtle">
                      <div className="text-center text-semantic-text-muted">
                        <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Interactive trend chart coming soon</p>
                        <p className="text-xs">Track experiment performance over time</p>
                      </div>
                    </div>

                    {/* Trend Summary */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-semantic-text-primary">+23%</div>
                        <div className="text-sm text-semantic-text-secondary">Success Rate Growth</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-semantic-text-primary">+41%</div>
                        <div className="text-sm text-semantic-text-secondary">Participation Increase</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-semantic-text-primary">+18%</div>
                        <div className="text-sm text-semantic-text-secondary">Experiment Volume</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-semantic-text-primary">
                      Experiment Type Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 border border-semantic-border rounded-lg flex items-center justify-center bg-semantic-background-subtle">
                      <div className="text-center text-semantic-text-muted">
                        <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Interactive pie chart</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-semantic-text-primary">
                      Success Distribution by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 border border-semantic-border rounded-lg flex items-center justify-center bg-semantic-background-subtle">
                      <div className="text-center text-semantic-text-muted">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Interactive bar chart</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium text-semantic-text-primary">
                    Performance Metrics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 border border-semantic-border rounded-lg text-center">
                      <div className="text-2xl font-bold text-semantic-text-primary">87.3%</div>
                      <div className="text-sm text-semantic-text-secondary">Overall Success</div>
                      <div className="text-xs text-semantic-success">+5.2% from baseline</div>
                    </div>
                    <div className="p-4 border border-semantic-border rounded-lg text-center">
                      <div className="text-2xl font-bold text-semantic-text-primary">94.1%</div>
                      <div className="text-sm text-semantic-text-secondary">Completion Rate</div>
                      <div className="text-xs text-semantic-success">+2.8% improvement</div>
                    </div>
                    <div className="p-4 border border-semantic-border rounded-lg text-center">
                      <div className="text-2xl font-bold text-semantic-text-primary">14.2d</div>
                      <div className="text-sm text-semantic-text-secondary">Avg Duration</div>
                      <div className="text-xs text-semantic-text-muted">Within target range</div>
                    </div>
                    <div className="p-4 border border-semantic-border rounded-lg text-center">
                      <div className="text-2xl font-bold text-semantic-text-primary">1,423</div>
                      <div className="text-sm text-semantic-text-secondary">Active Participants</div>
                      <div className="text-xs text-semantic-success">+12% growth</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};