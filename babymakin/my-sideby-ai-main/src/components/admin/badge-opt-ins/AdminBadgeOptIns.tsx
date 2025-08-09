import React, { useState } from 'react';
import { useAdminBadgeOptIns } from '@/hooks/useAdminBadgeOptIns';
import { exportBadgeOptInsToCSV } from '@/utils/badgeOptInsCsvExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { BACK_TO_SCHOOL_BADGE_ID } from '@/utils/badgeLaunchConfig';

const AdminBadgeOptIns = () => {
  const { optIns, isLoading, error, refetch } = useAdminBadgeOptIns();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Enroll Back to School badge state
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [searching, setSearching] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Filter opt-ins based on search query
  const filteredOptIns = optIns.filter(optIn => 
    optIn.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    optIn.user_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    optIn.user_last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    optIn.badge_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    try {
      exportBadgeOptInsToCSV(filteredOptIns);
      toast({
        title: "Export successful",
        description: `Exported ${filteredOptIns.length} badge opt-ins to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export badge opt-ins",
        variant: "destructive"
      });
    }
  };

const handleRefresh = async () => {
  await refetch();
  toast({
    title: "Data refreshed",
    description: "Badge opt-ins data has been updated",
  });
};

// Search members by email or name
const handleMemberSearch = async () => {
  try {
    setSearching(true);
    setMemberResults([]);
    setSelectedMember(null);
    if (!memberQuery.trim()) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, status')
      .or(`email.ilike.%${memberQuery}%,first_name.ilike.%${memberQuery}%,last_name.ilike.%${memberQuery}%`)
      .neq('status', 'deleted')
      .limit(20);

    if (error) throw error;
    setMemberResults(data || []);
  } catch (err: any) {
    toast({
      title: 'Search failed',
      description: err.message || 'Unable to search members',
      variant: 'destructive'
    });
  } finally {
    setSearching(false);
  }
};

// Enroll selected member into Back to School badge
const handleEnrollSelected = async () => {
  if (!selectedMember) return;
  try {
    setEnrolling(true);
    const badgeId = BACK_TO_SCHOOL_BADGE_ID;

    // Check existing
    const { data: existing, error: existingErr } = await supabase
      .from('badge_opt_ins')
      .select('id, notifications_enabled')
      .eq('user_id', selectedMember.id)
      .eq('badge_id', badgeId)
      .maybeSingle();

    if (existingErr) throw existingErr;

    if (existing) {
      const { error: updateErr } = await supabase
        .from('badge_opt_ins')
        .update({ notifications_enabled: notifyEnabled })
        .eq('id', existing.id);
      if (updateErr) throw updateErr;
      toast({ title: 'Enrollment updated', description: 'Notification preference updated for user.' });
    } else {
      const { error: insertErr } = await supabase
        .from('badge_opt_ins')
        .insert([{ user_id: selectedMember.id, badge_id: badgeId, notifications_enabled: notifyEnabled }]);
      if (insertErr) throw insertErr;
      toast({ title: 'User enrolled', description: 'Member enrolled in Back to School badge.' });
    }

    await refetch();
    setSelectedMember(null);
    setMemberResults([]);
    setMemberQuery('');
  } catch (err: any) {
    toast({ title: 'Enrollment failed', description: err.message || 'Unable to enroll user', variant: 'destructive' });
  } finally {
    setEnrolling(false);
  }
};

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Badge Opt-ins</h1>
          <p className="text-muted-foreground">
            Manage and export user badge opt-in preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isLoading || filteredOptIns.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV ({filteredOptIns.length})
          </Button>
        </div>
      </div>

      {/* Enroll Back to School badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Enroll Back to School Badge</CardTitle>
              <CardDescription>Search a member and enroll them into the Back to School badge</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Notifications</span>
              <Switch checked={notifyEnabled} onCheckedChange={setNotifyEnabled} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative w-96 max-w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search members by email, first or last name"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleMemberSearch} variant="outline" disabled={searching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${searching ? 'animate-spin' : ''}`} />
              Search
            </Button>
            <Button onClick={handleEnrollSelected} disabled={!selectedMember || enrolling}>
              {enrolling && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Enroll selected
            </Button>
          </div>

          {/* Results */}
          <div className="mt-4 space-y-2">
            {selectedMember && (
              <div className="text-sm text-foreground">
                Selected: <span className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</span> <span className="text-muted-foreground">({selectedMember.email})</span>
                <Button variant="ghost" className="ml-2" onClick={() => setSelectedMember(null)}>Clear</Button>
              </div>
            )}
            {memberResults.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberResults.map((u) => (
                      <TableRow key={u.id} className={selectedMember?.id === u.id ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <div className="font-medium">{u.first_name} {u.last_name}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-right">
                          <Button variant={selectedMember?.id === u.id ? 'secondary' : 'outline'} size="sm" onClick={() => setSelectedMember(u)}>
                            {selectedMember?.id === u.id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!searching && memberQuery && memberResults.length === 0 && (
              <div className="text-sm text-muted-foreground">No members found</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Badge Opt-ins Overview</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading...' : `${optIns.length} total opt-ins found`}
              </CardDescription>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by email, name, or badge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading badge opt-ins...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Opted In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOptIns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No opt-ins match your search' : 'No badge opt-ins found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOptIns.map((optIn) => (
                      <TableRow key={optIn.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {optIn.user_first_name} {optIn.user_last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {optIn.user_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{optIn.badge_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {optIn.badge_description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {optIn.badge_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={optIn.notifications_enabled ? "default" : "outline"}>
                            {optIn.notifications_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(optIn.opted_in_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBadgeOptIns;