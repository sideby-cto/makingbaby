
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface NotificationQueueStatusProps {
  stats: {
    pending: number;
    sent: number;
    failed: number;
  };
}

export function NotificationQueueStatus({ stats }: NotificationQueueStatusProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="flex items-center p-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <h4 className="text-2xl font-bold">{stats.pending}</h4>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-4">
          <div className="bg-green-100 p-2 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">Sent</p>
            <h4 className="text-2xl font-bold">{stats.sent}</h4>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-4">
          <div className="bg-red-100 p-2 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-muted-foreground">Failed</p>
            <h4 className="text-2xl font-bold">{stats.failed}</h4>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
