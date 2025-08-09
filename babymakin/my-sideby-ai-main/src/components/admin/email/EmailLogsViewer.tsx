
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Eye, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { centralizedEmailService } from '@/services/email/centralizedEmailService';
import { supabase } from '@/integrations/supabase/client';

interface EmailLog {
  id: string;
  template_id: string;
  recipient_email: string;
  subject: string;
  rendered_html: string;
  variables_used: any;
  account_type: string;
  status: string;
  error_message?: string;
  sent_at?: string;
  created_at: string;
  email_templates?: {
    name: string;
    template_key: string;
  };
}

export function EmailLogsViewer() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredLogs(
        logs.filter(log => 
          log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.email_templates?.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredLogs(logs);
    }
  }, [logs, searchTerm]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Authentication required');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Use the updated admin validation function that now uses profiles table
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin_user');

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setError('Failed to verify admin access');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(adminCheck);
      
      if (adminCheck) {
        loadLogs();
      } else {
        setError('Admin access required');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError('Authentication failed');
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await centralizedEmailService.getEmailLogs(currentPage, 50);
      setLogs(response.logs as EmailLog[]);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      console.error('Error loading email logs:', error);
      setError('Failed to load email logs');
      toast({
        title: "Error loading email logs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && currentPage === 1) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || isAdmin === false) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'You need admin privileges to access email logs.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Logs</h1>
          <p className="text-muted-foreground">Total emails: {totalCount}</p>
        </div>
        <Button onClick={loadLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, subject, or template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{log.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    To: {log.recipient_email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Template: {log.email_templates?.name || 'Unknown'} 
                    ({log.email_templates?.template_key || 'N/A'})
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge className={getStatusBadgeColor(log.status)}>
                    {log.status}
                  </Badge>
                  <Badge variant="outline">
                    {log.account_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Created:</strong> {formatDate(log.created_at)}</p>
                  {log.sent_at && (
                    <p><strong>Sent:</strong> {formatDate(log.sent_at)}</p>
                  )}
                  {log.error_message && (
                    <p className="text-red-600">
                      <strong>Error:</strong> {log.error_message}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <EmailLogDetailDialog log={log} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

interface EmailLogDetailDialogProps {
  log: EmailLog;
}

function EmailLogDetailDialog({ log }: EmailLogDetailDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Recipient:</strong> {log.recipient_email}
            </div>
            <div>
              <strong>Status:</strong> 
              <Badge className={`ml-2 ${getStatusBadgeColor(log.status)}`}>
                {log.status}
              </Badge>
            </div>
            <div>
              <strong>Template:</strong> {log.email_templates?.name || 'Unknown'}
            </div>
            <div>
              <strong>Account Type:</strong> {log.account_type}
            </div>
            <div>
              <strong>Created:</strong> {formatDate(log.created_at)}
            </div>
            {log.sent_at && (
              <div>
                <strong>Sent:</strong> {formatDate(log.sent_at)}
              </div>
            )}
          </div>

          {log.error_message && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <strong className="text-red-800">Error:</strong>
              <p className="text-red-700 mt-1">{log.error_message}</p>
            </div>
          )}

          <div>
            <strong>Subject:</strong>
            <p className="bg-muted p-2 rounded mt-1">{log.subject}</p>
          </div>

          <div>
            <strong>Variables Used:</strong>
            <pre className="bg-muted p-2 rounded mt-1 text-sm overflow-x-auto">
              {JSON.stringify(log.variables_used, null, 2)}
            </pre>
          </div>

          <div>
            <strong>Rendered Email:</strong>
            <div 
              className="border rounded bg-white p-4 mt-1"
              dangerouslySetInnerHTML={{ __html: log.rendered_html }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'sent': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}
