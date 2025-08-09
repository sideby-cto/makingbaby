import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { SponsorshipRequestsTable } from '@/components/admin/sponsorship/SponsorshipRequestsTable';
import { useToast } from '@/hooks/use-toast';

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

const AdminSponsorshipRequests = () => {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsorships')
        .select(`
          *,
          profile: profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching sponsorship requests:', error);
      toast({
        title: "Error",
        description: "Failed to load sponsorship requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('sponsorships')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));

      toast({
        title: "Status Updated",
        description: `Request status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 space-y-6 bg-semantic-background">
        <div>
          <h1 className="text-display-sm text-semantic-text-primary font-sans">Sponsorship Requests</h1>
          <p className="text-body-lg text-semantic-text-secondary">
            Manage tool sponsorship requests from users
          </p>
        </div>

        <SponsorshipRequestsTable 
          requests={requests}
          loading={loading}
          onStatusChange={handleStatusChange}
          onRefresh={fetchRequests}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminSponsorshipRequests;
