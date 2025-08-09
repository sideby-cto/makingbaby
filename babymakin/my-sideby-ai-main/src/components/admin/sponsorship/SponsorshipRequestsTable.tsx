
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Loader2, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';
import { AssignToolDialog } from './AssignToolDialog';

interface SponsorshipRequest {
  id: string;
  user_id: string;
  tool_name: string;
  store: string;
  district: string;
  region: string;
  created_at: string;
  status: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface SponsorshipRequestsTableProps {
  requests: SponsorshipRequest[];
  loading: boolean;
  onStatusChange: (requestId: string, status: string) => Promise<void>;
  onRefresh: () => void;
}

export const SponsorshipRequestsTable = ({
  requests,
  loading,
  onStatusChange,
  onRefresh
}: SponsorshipRequestsTableProps) => {
  const [assigningRequest, setAssigningRequest] = useState<SponsorshipRequest | null>(null);
  const { toast } = useToast();

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'denied':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const handleApprove = async (request: SponsorshipRequest) => {
    await onStatusChange(request.id, 'approved');
    setAssigningRequest(request);
  };

  const handleDeny = async (request: SponsorshipRequest) => {
    await onStatusChange(request.id, 'denied');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          className="flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requested By</TableHead>
              <TableHead>Tool Requested</TableHead>
              <TableHead>School/District</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Date Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <span className="text-sm text-muted-foreground mt-2 block">
                    Loading requests...
                  </span>
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-muted-foreground">No sponsorship requests found.</p>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {request.profile?.first_name} {request.profile?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.profile?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{request.tool_name}</TableCell>
                  <TableCell>{request.district || request.store || 'N/A'}</TableCell>
                  <TableCell>{request.region || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(request.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(request.status) as any}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(request)}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeny(request)}
                          className="flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          Deny
                        </Button>
                      </div>
                    ) : request.status === 'approved' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssigningRequest(request)}
                      >
                        Assign Tool
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {assigningRequest && (
        <AssignToolDialog
          request={assigningRequest}
          onClose={() => setAssigningRequest(null)}
        />
      )}
    </div>
  );
};
