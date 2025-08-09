
import React, { useEffect, useState } from "react";
import { AdminActionsCard } from "@/components/admin/dashboard/components/AdminActionsCard";
import { MatchCompletionStats } from "@/components/admin/matchmaker/stats/MatchCompletionStats";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RecentActivityList } from "@/components/admin/dashboard/charts/RecentActivityList";
import { supabase } from "@/integrations/supabase/client";

interface AdminOverviewTabProps {
  processGaps: any[];
  handleAddGap: (description: string) => Promise<void>;
  handleCloseGap: (gapId: string) => Promise<void>;
}

export const AdminOverviewTab = ({ processGaps, handleAddGap, handleCloseGap }: AdminOverviewTabProps) => {
  const [userTools, setUserTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUserTools = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_tools')
          .select('*, tools(*)');
        
        if (error) {
          console.error('Error fetching user tools:', error);
          setUserTools([]);
        } else {
          setUserTools(data || []);
        }
      } catch (error) {
        console.error('Error fetching user tools:', error);
        setUserTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUserTools();
  }, []);

  return (
    <div className="grid gap-8">
      {/* Platform Overview card spans full width */}
      <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-heading-lg text-semantic-text-primary font-sans">
            Platform Overview
          </CardTitle>
          <CardDescription className="text-body-md text-semantic-text-secondary">
            Monitor key metrics and recent activity
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <MatchCompletionStats />
        </CardContent>
      </Card>

      {/* Tool Sponsorships section - now takes full width */}
      <div className="grid gap-8">
        <AdminActionsCard userTools={userTools} loading={loading} />
      </div>
      
      {/* Bottom section with recent activity */}
      <Card className="border border-semantic-border bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-heading-lg text-semantic-text-primary font-sans">
            Recent Activity
          </CardTitle>
          <CardDescription className="text-body-md text-semantic-text-secondary">
            Recent sign-ups and matches across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <RecentActivityList />
        </CardContent>
      </Card>
    </div>
  );
};
