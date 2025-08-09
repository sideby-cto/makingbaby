import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, TrendingUp, Activity } from "lucide-react";

interface UserSessionAnalyticsProps {
  analytics: any;
  loading: boolean;
  timeRange: string;
}

export const UserSessionAnalytics: React.FC<UserSessionAnalyticsProps> = ({
  analytics,
  loading,
  timeRange
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionData = analytics?.sessionsByDay || [];
  const timeOfDayData = analytics?.sessionsByTimeOfDay || [];

  return (
    <div className="space-y-6">
      {/* Session Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Total Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.totalSessions || 0}
            </div>
            <p className="text-xs text-semantic-text-muted">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Avg Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.averageDuration || 0}m
            </div>
            <p className="text-xs text-semantic-text-muted">
              +5% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Bounce Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.bounceRate || 0}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              -3% vs last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Return Rate
            </CardTitle>
            <Users className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.returnRate || 0}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              +8% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-semantic-text-primary">Session Volume Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
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
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#sessionGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-semantic-text-primary">Session Patterns by Time of Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeOfDayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[0, 23]}
                type="number"
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelFormatter={(value) => `${value}:00`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Session Quality Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Session Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-semantic-text-secondary">Deep Engagement Rate</span>
                <span className="font-semibold text-semantic-text-primary">73%</span>
              </div>
              <div className="w-full bg-semantic-border rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '73%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-semantic-text-secondary">Task Completion Rate</span>
                <span className="font-semibold text-semantic-text-primary">85%</span>
              </div>
              <div className="w-full bg-semantic-border rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-semantic-text-secondary">Interactive Element Usage</span>
                <span className="font-semibold text-semantic-text-primary">92%</span>
              </div>
              <div className="w-full bg-semantic-border rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-semantic-text-primary">Session Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Peak Activity</h4>
                <p className="text-sm text-semantic-text-secondary">
                  Most users are active between 2:00 PM - 4:00 PM, suggesting optimal time for live features.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Session Length</h4>
                <p className="text-sm text-semantic-text-secondary">
                  Average session duration increased by 5 minutes, indicating improved engagement.
                </p>
              </div>
              
              <div className="p-3 bg-semantic-background rounded-lg border border-semantic-border">
                <h4 className="font-medium text-semantic-text-primary mb-2">Drop-off Points</h4>
                <p className="text-sm text-semantic-text-secondary">
                  15% of users leave during initial content loading - optimization needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};