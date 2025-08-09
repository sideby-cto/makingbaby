import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SponsorshipGrid } from '@/components/admin/sponsorship/SponsorshipGrid';
import { UserToolGrid } from '@/components/admin/sponsorship/UserToolGrid';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import AdminLayout from '@/components/admin/layout/AdminLayout';

// Use database Profile type 
import type { Profile, UserTool } from '@/types/database';
import type { Json } from '@/integrations/supabase/types';

const AdminSponsorship = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(
        profile => 
          (profile.first_name && profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (profile.last_name && profile.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (profile.email && profile.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProfiles(filtered);
    }
  }, [searchTerm, profiles]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_tools (
            id,
            tool_id,
            assigned_at,
            expires_at,
            status,
            tools (
              id,
              name,
              description,
              url,
              price_per_month,
              type
            )
          ),
          user_pacing_preferences (
            community_id,
            pacing_level
          )
        `)
        .order('first_name', { ascending: true });

      if (error) throw error;

      // Transform the subject_statuses to match database Profile type
      const transformedData = data.map(profile => {
        // Ensure subject_statuses is a Record<string, string>
        let transformedSubjectStatuses: Record<string, string> = {};
        
        if (profile.subject_statuses) {
          // Handle array format
          if (Array.isArray(profile.subject_statuses)) {
            profile.subject_statuses.forEach((status: any) => {
              if (typeof status === 'object' && status.name && status.status) {
                transformedSubjectStatuses[status.name] = status.status;
              }
            });
          } 
          // Handle object format
          else if (typeof profile.subject_statuses === 'object') {
            transformedSubjectStatuses = profile.subject_statuses as Record<string, string>;
          }
        }
        
        // Transform user_tools to match UserTool type
        const transformedUserTools: UserTool[] = profile.user_tools 
          ? profile.user_tools.map((tool: any) => ({
              id: tool.id,
              user_id: profile.id,
              tool_id: tool.tool_id,
              assigned_by: '', // Default value since it's required
              assigned_at: tool.assigned_at,
              expires_at: tool.expires_at,
              status: tool.status,
              created_at: tool.created_at || profile.created_at,
              updated_at: tool.updated_at || profile.updated_at,
              tools: tool.tools
            }))
          : [];
        
        return {
          ...profile,
          subject_statuses: transformedSubjectStatuses,
          user_tools: transformedUserTools
        } as unknown as Profile;
      });

      setProfiles(transformedData);
      setFilteredProfiles(transformedData);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Sponsorships</h1>
            <p className="text-muted-foreground">
              Manage user tool sponsorships
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SponsorshipGrid 
              profiles={filteredProfiles}
            />
          </div>
          <div>
            {selectedUserId && (
              <UserToolGrid 
                profile={profiles.find(p => p.id === selectedUserId)!}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSponsorship;
