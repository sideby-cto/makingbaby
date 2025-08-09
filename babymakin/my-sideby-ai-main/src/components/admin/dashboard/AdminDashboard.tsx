
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, MessageSquare } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
import { SessionMonitoring } from "./SessionMonitoring";
import { AutomaticMatchStatus } from "./AutomaticMatchStatus";
import { ChaosTestingCard } from "./ChaosTestingCard";
import { AdminUpduoPanel } from "./AdminUpduoPanel";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminDashboard = () => {
  const { stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="admin-dashboard-loading">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="loading-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} data-testid={`loading-stats-card-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" data-testid={`loading-title-${i}`}></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" data-testid={`loading-icon-${i}`}></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2" data-testid={`loading-value-${i}`}></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" data-testid={`loading-description-${i}`}></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="stats-overview">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Registered users"
          data-testid="total-users-card"
        />
        <StatsCard
          title="Active Matches"
          value={stats?.activeMatches || 0}
          icon={UserCheck}
          description="Currently active matches"
          data-testid="active-matches-card"
        />
        <StatsCard
          title="Pending Matches"
          value={stats?.pendingMatches || 0}
          icon={Clock}
          description="Awaiting completion"
          data-testid="pending-matches-card"
        />
        <StatsCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={MessageSquare}
          description="Match conversations"
          data-testid="total-messages-card"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="dashboard-content">
        {/* Session Monitoring */}
        <div data-testid="session-monitoring-section">
          <SessionMonitoring />
        </div>
        
        {/* Automatic Match Completion Status */}
        <div data-testid="match-status-section">
          <AutomaticMatchStatus />
        </div>
        
        {/* Chaos Testing */}
        <div data-testid="chaos-testing-section">
          <ChaosTestingCard />
        </div>
      </div>

      {/* Recent Activity */}
      <div data-testid="recent-activity-section">
        <RecentActivity />
      </div>
    </div>
  );
};
