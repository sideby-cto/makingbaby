import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface CohortAnalysisViewProps {
  analytics: any;
  loading: boolean;
  timeRange: string;
}

export const CohortAnalysisView: React.FC<CohortAnalysisViewProps> = ({
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

  const retentionData = analytics?.retentionCohorts || [];
  const engagementData = analytics?.engagementCohorts || [];
  const learningData = analytics?.learningCohorts || [];

  return (
    <div className="space-y-6">
      {/* Retention Cohorts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-semantic-text-primary">User Retention by Cohort</CardTitle>
          <p className="text-sm text-semantic-text-secondary">
            Percentage of users remaining active over time
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="cohort" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="week0" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Week 0"
              />
              <Line 
                type="monotone" 
                dataKey="week1" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name="Week 1"
              />
              <Line 
                type="monotone" 
                dataKey="week4" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Week 4"
              />
              <Line 
                type="monotone" 
                dataKey="week12" 
                stroke="hsl(var(--muted))" 
                strokeWidth={2}
                name="Week 12"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Cohorts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-semantic-text-primary">Engagement Distribution by Cohort</CardTitle>
          <p className="text-sm text-semantic-text-secondary">
            Distribution of engagement levels across different user cohorts
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="cohort" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="high" 
                stackId="engagement"
                fill="hsl(var(--primary))"
                name="High Engagement"
              />
              <Bar 
                dataKey="medium" 
                stackId="engagement"
                fill="hsl(var(--secondary))"
                name="Medium Engagement"
              />
              <Bar 
                dataKey="low" 
                stackId="engagement"
                fill="hsl(var(--muted))"
                name="Low Engagement"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Learning Speed Cohorts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-semantic-text-primary">Learning Speed Distribution</CardTitle>
          <p className="text-sm text-semantic-text-secondary">
            How quickly different cohorts progress through learning materials
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={learningData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="cohort" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="fast" 
                stackId="learning"
                fill="hsl(var(--primary))"
                name="Fast Learners"
              />
              <Bar 
                dataKey="moderate" 
                stackId="learning"
                fill="hsl(var(--secondary))"
                name="Moderate Pace"
              />
              <Bar 
                dataKey="slow" 
                stackId="learning"
                fill="hsl(var(--muted))"
                name="Need Support"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cohort Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Retention Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Best Performing Cohort</h4>
                <p className="text-sm text-semantic-text-secondary">
                  Feb 2024 cohort shows 62% retention at 12 weeks, highest this year.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Critical Drop-off</h4>
                <p className="text-sm text-semantic-text-secondary">
                  Most significant drop occurs between week 1 and week 4 across all cohorts.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Improvement Opportunity</h4>
                <p className="text-sm text-semantic-text-secondary">
                  Early intervention strategies could improve 4-week retention by 15%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Engagement Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">High Performers</h4>
                <p className="text-sm text-semantic-text-secondary">
                  85% of high engagement users maintain activity for 12+ weeks.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Engagement Factors</h4>
                <p className="text-sm text-semantic-text-secondary">
                  Users with mentor connections show 2.3x higher engagement levels.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Recovery Potential</h4>
                <p className="text-sm text-semantic-text-secondary">
                  40% of low-engagement users can be re-activated with targeted interventions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Learning Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Fast Learners</h4>
                <p className="text-sm text-semantic-text-secondary">
                  70% of fast learners complete advanced tracks within 8 weeks.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Support Needs</h4>
                <p className="text-sm text-semantic-text-secondary">
                  65% of slow learners benefit from additional mentoring and resources.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Optimal Pacing</h4>
                <p className="text-sm text-semantic-text-secondary">
                  Moderate pace learners show highest overall satisfaction and completion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};