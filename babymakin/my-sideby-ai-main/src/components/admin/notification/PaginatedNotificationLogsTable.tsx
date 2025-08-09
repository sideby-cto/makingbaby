
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { NotificationLog } from './types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginatedNotificationLogsTableProps {
  isLoading?: boolean;
}

const PAGE_SIZE = 10;

export const PaginatedNotificationLogsTable: React.FC<PaginatedNotificationLogsTableProps> = ({ 
  isLoading: externalLoading = false 
}) => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchLogs = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * PAGE_SIZE;
      
      // Get total count
      const { count, error: countError } = await supabase
        .from('notification_delivery_logs')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      setTotalCount(count || 0);

      // Get paginated data
      const { data, error } = await supabase
        .from('notification_delivery_logs')
        .select('*')
        .order('last_attempt_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching notification logs:', err);
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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

  const isLoadingState = loading || externalLoading;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Delivery Logs</h3>
        <div className="text-sm text-gray-500">
          {totalCount > 0 && (
            <>Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)} - {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} logs</>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
          Error loading logs: {error}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
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
            {isLoadingState ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading logs...</p>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No delivery logs found.</p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
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
                      className={`px-2 py-1 rounded text-sm ${
                        log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </TableCell>
                  <TableCell>{log.attempt_count}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(log.last_attempt_at), 'MMM dd, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="line-clamp-1 cursor-help text-sm">
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoadingState}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoadingState}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoadingState}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
