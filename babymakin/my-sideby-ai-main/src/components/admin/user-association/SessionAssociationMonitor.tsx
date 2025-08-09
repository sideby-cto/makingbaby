import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Search, TrendingUp, Users, AlertTriangle, CheckCircle, XCircle, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SessionAssociation {
  id: string;
  session_id: string;
  sideby_user_id: string;
  upduo_user_id: string;
  association_method: string;
  confidence_score: number;
  verified: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const SessionAssociationMonitor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [isProcessingRecentSessions, setIsProcessingRecentSessions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch session associations
  const { data: associations, isLoading } = useQuery({
    queryKey: ['session-associations', searchTerm, methodFilter, verificationFilter],
    queryFn: async () => {
      let query = supabase
        .from('upduo_session_associations')
        .select(`
          *,
          profiles:sideby_user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`session_id.ilike.%${searchTerm}%,upduo_user_id.ilike.%${searchTerm}%`);
      }

      if (methodFilter !== 'all') {
        query = query.eq('association_method', methodFilter);
      }

      if (verificationFilter !== 'all') {
        query = query.eq('verified', verificationFilter === 'verified');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SessionAssociation[];
    }
  });

  // Fetch association statistics
  const { data: stats } = useQuery({
    queryKey: ['association-stats'],
    queryFn: async () => {
      // Get basic counts from the tables
      const [sessionsResult, mappingsResult, associationsResult] = await Promise.all([
        supabase.from('upduo_session_associations').select('*', { count: 'exact', head: true }),
        supabase.from('upduo_user_mappings').select('*', { count: 'exact', head: true }),
        supabase.from('upduo_session_associations').select('verified', { count: 'exact' }).eq('verified', false)
      ]);
      
      return {
        total_sessions: sessionsResult.count || 0,
        associated_users: mappingsResult.count || 0,
        association_rate: mappingsResult.count && sessionsResult.count 
          ? (mappingsResult.count / sessionsResult.count) * 100 
          : 0,
        unverified_count: associationsResult.count || 0
      };
    }
  });

  // Mutation for verifying/rejecting associations
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ associationId, verified }: { associationId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('upduo_session_associations')
        .update({ verified })
        .eq('id', associationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-associations'] });
      queryClient.invalidateQueries({ queryKey: ['association-stats'] });
      toast({
        title: "Success",
        description: "Association verification updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update verification",
        variant: "destructive",
      });
    }
  });

  // Function to process recent sessions for name-based matching
  const handleProcessRecentSessions = async () => {
    setIsProcessingRecentSessions(true);
    try {
      // Call the Upduo sessions API to get recent sessions
      const { data: sessionsData, error: sessionsError } = await supabase.functions.invoke('upduo-sessions', {
        body: { count: 20, includeTranscript: false }
      });

      if (sessionsError) throw sessionsError;
      
      const sessions = sessionsData?.sessions || [];
      let associationsCreated = 0;
      let associationsSkipped = 0;

      for (const session of sessions) {
        // Check if session already has associations
        const { data: existingAssociations } = await supabase
          .from('upduo_session_associations')
          .select('id')
          .eq('session_id', session.id)
          .limit(1);

        if (existingAssociations && existingAssociations.length > 0) {
          associationsSkipped++;
          continue;
        }

        // Process each user in the session
        for (const user of session.users || []) {
          try {
            // First, check if we have an existing mapping for this user
            const { data: existingMapping } = await supabase
              .from('upduo_user_mappings')
              .select('sideby_user_id')
              .or(`upduo_user_id.eq.${user.id},upduo_first_name.ilike.${user.firstName},upduo_last_name.ilike.${user.lastName}`)
              .eq('verified', true)
              .limit(1);

            if (existingMapping && existingMapping.length > 0) {
              // Create association using existing mapping
              await supabase
                .from('upduo_session_associations')
                .insert({
                  session_id: session.id,
                  sideby_user_id: existingMapping[0].sideby_user_id,
                  upduo_user_id: user.id,
                  association_method: 'existing_mapping',
                  confidence_score: 1.0,
                  verified: true
                });
              associationsCreated++;
              continue;
            }

            // Try to find a sideby user by name matching
            const { data: nameMatches } = await supabase.functions.invoke('find-upduo-users-by-name', {
              body: {
                firstName: user.firstName,
                lastName: user.lastName,
                limit: 5
              }
            });

            if (nameMatches?.success && nameMatches.matches?.length > 0) {
              const bestMatch = nameMatches.matches[0];
              
              // Only auto-associate if it's an exact match with high confidence
              if (bestMatch.matchType === 'exact' && bestMatch.confidenceScore >= 0.95) {
                await supabase
                  .from('upduo_session_associations')
                  .insert({
                    session_id: session.id,
                    sideby_user_id: bestMatch.sidebyUserId,
                    upduo_user_id: user.id,
                    association_method: 'exact_name_match',
                    confidence_score: bestMatch.confidenceScore,
                    verified: false // Requires manual verification for name matches
                  });
                associationsCreated++;
              }
            }
          } catch (error) {
            console.error(`Failed to process user ${user.id}:`, error);
          }
        }
      }

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['session-associations'] });
      queryClient.invalidateQueries({ queryKey: ['association-stats'] });

      toast({
        title: "Processing Complete",
        description: `Created ${associationsCreated} new associations. Skipped ${associationsSkipped} sessions that were already processed.`,
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process sessions",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRecentSessions(false);
    }
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'existing_mapping': return 'default';
      case 'exact_name_match': return 'secondary';
      case 'fuzzy_name_match': return 'outline';
      case 'manual': return 'destructive';
      default: return 'outline';
    }
  };

  const formatConfidenceScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Session Processing</h3>
              <p className="text-sm text-muted-foreground">
                Process recent Upduo sessions to automatically associate users based on name matching
              </p>
            </div>
            <Button
              onClick={handleProcessRecentSessions}
              disabled={isProcessingRecentSessions}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isProcessingRecentSessions ? 'Processing...' : 'Process Recent Sessions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total Sessions</p>
                <p className="text-2xl font-bold">{stats?.total_sessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Associated Users</p>
                <p className="text-2xl font-bold">{stats?.associated_users || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Association Rate</p>
                <p className="text-2xl font-bold">
                  {stats?.association_rate ? `${Math.round(stats.association_rate)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Unverified</p>
                <p className="text-2xl font-bold">{stats?.unverified_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Associations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Session Associations
          </CardTitle>
          <CardDescription>
            Monitor how Upduo users are being associated with sideby members
          </CardDescription>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by session ID or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="existing_mapping">Existing Mapping</SelectItem>
                <SelectItem value="exact_name_match">Exact Name Match</SelectItem>
                <SelectItem value="fuzzy_name_match">Fuzzy Name Match</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter by verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading associations...</div>
          ) : !associations?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No session associations found
            </div>
          ) : (
            <div className="space-y-4">
              {associations.map((association) => (
                <div
                  key={association.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {association.session_id}
                      </Badge>
                      <Badge variant="outline">
                        Upduo: {association.upduo_user_id}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <strong>sideby User:</strong> {association.profiles?.first_name} {association.profiles?.last_name} ({association.profiles?.email})
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant={getMethodBadgeVariant(association.association_method)}>
                        {association.association_method.replace('_', ' ')}
                      </Badge>
                      <span className={getConfidenceColor(association.confidence_score)}>
                        Confidence: {formatConfidenceScore(association.confidence_score)}
                      </span>
                      <Badge variant={association.verified ? "default" : "secondary"}>
                        {association.verified ? "Verified" : "Unverified"}
                      </Badge>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(association.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons for manual verification */}
                  {!association.verified && association.association_method !== 'existing_mapping' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateVerificationMutation.mutate({
                          associationId: association.id,
                          verified: true
                        })}
                        disabled={updateVerificationMutation.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateVerificationMutation.mutate({
                          associationId: association.id,
                          verified: false
                        })}
                        disabled={updateVerificationMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};