
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SidebyActivityChart } from "@/components/admin/dashboard/charts/SidebyActivityChart";
import { UpduoActivityChart } from "@/components/admin/dashboard/charts/UpduoActivityChart";
import { SidebyActivityLineChart } from "@/components/admin/dashboard/charts/SidebyActivityLineChart";
import { UpduoActivityLineChart } from "@/components/admin/dashboard/charts/UpduoActivityLineChart";
import { PacingChart } from "@/components/admin/dashboard/charts/PacingChart";
import { LearningEvidenceChart } from "@/components/admin/dashboard/charts/LearningEvidenceChart";
import { MatchCompletionStats } from "@/components/admin/matchmaker/stats/MatchCompletionStats";
import { useUpduoTranscripts } from "@/hooks/useUpduoTranscripts";

export const AdminMetricsTab = () => {
  // Fetch Upduo transcripts data to pass to charts
  const { data: transcripts, isLoading: transcriptsLoading } = useUpduoTranscripts();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-heading-md text-semantic-text-primary font-sans">Platform Engagement</CardTitle>
            <CardDescription className="text-body-md text-semantic-text-secondary">sideby user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <SidebyActivityChart />
          </CardContent>
        </Card>
        
        <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-heading-md text-semantic-text-primary font-sans">upduo Activity</CardTitle>
            <CardDescription className="text-body-md text-semantic-text-secondary">upduo session metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <UpduoActivityChart />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-heading-md text-semantic-text-primary font-sans">sideby Engagement Trends</CardTitle>
            <CardDescription className="text-body-md text-semantic-text-secondary">Activity over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <SidebyActivityLineChart activities={[]} />
          </CardContent>
        </Card>
        
        <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-heading-md text-semantic-text-primary font-sans">upduo Usage Trends</CardTitle>
            <CardDescription className="text-body-md text-semantic-text-secondary">Sessions over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <UpduoActivityLineChart transcripts={transcripts || []} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-heading-md text-semantic-text-primary font-sans">Pacing Distribution</CardTitle>
            <CardDescription className="text-body-md text-semantic-text-secondary">User pacing preferences</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <PacingChart pacingData={[]} isPacingLoading={false} />
          </CardContent>
        </Card>
        
        <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-heading-md text-semantic-text-primary font-sans">Learning Evidence</CardTitle>
            <CardDescription className="text-body-md text-semantic-text-secondary">Evidence of learning in sessions</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <LearningEvidenceChart value={0} max={100} />
          </CardContent>
        </Card>
      </div>
      
      <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-heading-md text-semantic-text-primary font-sans">Match Completion Metrics</CardTitle>
          <CardDescription className="text-body-md text-semantic-text-secondary">Match status and completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <MatchCompletionStats />
        </CardContent>
      </Card>
    </div>
  );
};
