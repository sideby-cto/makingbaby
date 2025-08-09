
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { NotificationLog } from './types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface NotificationLogsTableProps {
  logs: NotificationLog[];
  isLoading: boolean;
}

export const NotificationLogsTable: React.FC<NotificationLogsTableProps> = ({ 
  logs, 
  isLoading 
}) => {
  // Helper function to format notification ID
  const formatNotificationId = (log: NotificationLog) => {
    if (log.notification_id === '00000000-0000-0000-0000-000000000000') {
      return 'System Log';
    }
    
    if (log.notification_id === 'system-fallback') {
      return 'System Log';
    }
    
    return log.notification_id.substring(0, 8) + '...';
  };
  
  return (
    <>
      <h3 className="text-lg font-semibold mb-2">Recent Delivery Logs</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Notification ID</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs">
                {formatNotificationId(log)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    log.source_table === 'notifications' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    log.source_table === 'system' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }
                >
                  {log.source_table || 'notifications'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    log.channel === 'email' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    log.channel === 'sms' ? 'bg-green-50 text-green-700 border-green-200' :
                    log.channel === 'in_app' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    log.channel === 'cron_trigger' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    log.channel === 'edge_function' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                    'bg-purple-50 text-purple-700 border-purple-200'
                  }
                >
                  {log.channel}
                </Badge>
              </TableCell>
              <TableCell>
                <span 
                  className={`px-2 py-1 rounded ${
                    log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {log.success ? 'Success' : 'Failed'}
                </span>
              </TableCell>
              <TableCell>{log.attempt_count}</TableCell>
              <TableCell>
                {format(new Date(log.last_attempt_at), 'yyyy-MM-dd HH:mm:ss')}
              </TableCell>
              <TableCell className="max-w-[250px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="line-clamp-1 cursor-help">
                        {log.error || 'No Error'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{log.error || 'No Error'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isLoading && <p className="text-center py-4">Loading logs...</p>}
      {!isLoading && logs.length === 0 && (
        <p className="text-center py-4 text-muted-foreground">No delivery logs found.</p>
      )}
    </>
  );
};
