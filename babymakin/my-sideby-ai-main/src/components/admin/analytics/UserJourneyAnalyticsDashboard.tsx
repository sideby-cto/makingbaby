import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Users, Brain, Clock } from "lucide-react";
import { AnalyticsOverview } from "./components/AnalyticsOverview";
import { UserSessionAnalytics } from "./components/UserSessionAnalytics";
import { LearningProgressionAnalytics } from "./components/LearningProgressionAnalytics";
import { CohortAnalysisView } from "./components/CohortAnalysisView";
import { PredictiveInsightsView } from "./components/PredictiveInsightsView";
import { useUserJourneyAnalytics } from "./hooks/useUserJourneyAnalytics";

interface UserJourneyAnalyticsDashboardProps {
  className?: string;
}

export const UserJourneyAnalyticsDashboard: React.FC<UserJourneyAnalyticsDashboardProps> = ({ 
  className = "" 
}) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCohort, setSelectedCohort] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: analytics, isLoading: loading, error, refetch } = useUserJourneyAnalytics({
    timeRange,
    cohort: selectedCohort,
    refreshKey
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-semantic-text-secondary">
            Error loading analytics data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-semibold text-semantic-text-primary">
            User Journey Analytics
          </h1>
          <p className="text-body-md text-semantic-text-secondary">
            Comprehensive insights into user learning journeys and progression patterns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCohort} onValueChange={setSelectedCohort}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="new">New Users</SelectItem>
              <SelectItem value="returning">Returning Users</SelectItem>
              <SelectItem value="high-engagement">High Engagement</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Total Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.totalUsers || 0}
            </div>
            <p className="text-xs text-semantic-text-muted">
              +{analytics?.userGrowth || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Avg Session Time
            </CardTitle>
            <Clock className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.avgSessionTime || 0}m
            </div>
            <p className="text-xs text-semantic-text-muted">
              +{analytics?.sessionTimeGrowth || 0}% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Learning Completion
            </CardTitle>
            <Brain className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.completionRate || 0}%
            </div>
            <p className="text-xs text-semantic-text-muted">
              {analytics?.completionRateChange || 0}% vs target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-semantic-text-secondary">
              Engagement Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-semantic-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-semantic-text-primary">
              {analytics?.engagementScore || 0}
            </div>
            <p className="text-xs text-semantic-text-muted">
              {analytics?.engagementTrend || 0}% trend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Session Analytics</TabsTrigger>
          <TabsTrigger value="learning">Learning Progress</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <AnalyticsOverview 
            analytics={analytics}
            loading={loading}
            timeRange={timeRange}
          />
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-6">
          <UserSessionAnalytics 
            analytics={analytics?.sessionAnalytics}
            loading={loading}
            timeRange={timeRange}
          />
        </TabsContent>
        
        <TabsContent value="learning" className="mt-6">
          <LearningProgressionAnalytics 
            analytics={analytics?.learningAnalytics}
            loading={loading}
            timeRange={timeRange}
          />
        </TabsContent>
        
        <TabsContent value="cohorts" className="mt-6">
          <CohortAnalysisView 
            analytics={analytics?.cohortAnalytics}
            loading={loading}
            timeRange={timeRange}
          />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <PredictiveInsightsView 
            analytics={analytics?.predictiveInsights}
            loading={loading}
            timeRange={timeRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};