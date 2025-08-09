
import React from "react";

interface NotificationStatsProps {
  notificationStats: Record<string, {
    scheduledCount: number;
    sentCount: number;
    lastSentAt?: string;
  }>;
  templates: any[];
}

export function NotificationStats({ notificationStats, templates }: NotificationStatsProps) {
  // Calculate statistics
  const totalSent = Object.values(notificationStats).reduce((sum, stat) => sum + stat.sentCount, 0);
  const totalScheduled = Object.values(notificationStats).reduce((sum, stat) => sum + stat.scheduledCount, 0);
  
  // Group by stage to find most active stage
  const stageStats: Record<string, { sent: number, scheduled: number }> = {};
  templates.forEach(template => {
    const stats = notificationStats[template.id];
    if (!stats) return;
    
    if (!stageStats[template.stage]) {
      stageStats[template.stage] = { sent: 0, scheduled: 0 };
    }
    
    stageStats[template.stage].sent += stats.sentCount;
    stageStats[template.stage].scheduled += stats.scheduledCount;
  });
  
  // Find most active stage
  let mostActiveStageName = "";
  let mostActiveStageSent = 0;
  
  Object.entries(stageStats).forEach(([stage, stats]) => {
    if (stats.sent > mostActiveStageSent) {
      mostActiveStageName = stage;
      mostActiveStageSent = stats.sent;
    }
  });

  // Only show stats if we have data
  if (totalSent === 0 && totalScheduled === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 border rounded-md p-4 mb-6 text-sm">
      <h3 className="font-medium mb-2">Notification Statistics:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-muted-foreground">Total Sent:</p>
          <p className="text-xl font-bold">{totalSent}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Scheduled:</p>
          <p className="text-xl font-bold">{totalScheduled}</p>
        </div>
        {mostActiveStageName && (
          <div>
            <p className="text-muted-foreground">Most Active Stage:</p>
            <p className="text-xl font-bold">{mostActiveStageName.replace(/_/g, ' ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
