import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Search, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpduoUserMapping {
  id: string;
  sideby_user_id: string;
  upduo_user_id: string;
  upduo_first_name: string;
  upduo_last_name: string;
  confidence_score: number;
  mapping_method: string;
  verified: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface SidebyProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const UpduoUserAssociationPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSidebyUser, setSelectedSidebyUser] = useState<string>('');
  const [upduoUserId, setUpduoUserId] = useState('');
  const [upduoFirstName, setUpduoFirstName] = useState('');
  const [upduoLastName, setUpduoLastName] = useState('');
  const [isSearchingByName, setIsSearchingByName] = useState(false);
  const [nameSearchResults, setNameSearchResults] = useState<any[]>([]);
  const [isLoadingNameSearch, setIsLoadingNameSearch] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user mappings
  const { data: mappings, isLoading: loadingMappings } = useQuery({
    queryKey: ['upduo-user-mappings', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('upduo_user_mappings')
        .select(`
          *,
          profiles:sideby_user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`upduo_first_name.ilike.%${searchTerm}%,upduo_last_name.ilike.%${searchTerm}%,upduo_user_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch Sideby users for selection
  const { data: sidebyUsers } = useQuery({
    queryKey: ['sideby-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');
      if (error) throw error;
      return data as SidebyProfile[];
    }
  });

  // Create mapping mutation
  const createMappingMutation = useMutation({
    mutationFn: async (mapping: {
      sideby_user_id: string;
      upduo_user_id: string;
      upduo_first_name: string;
      upduo_last_name: string;
    }) => {
      const { error } = await supabase
        .from('upduo_user_mappings')
        .insert({
          ...mapping,
          mapping_method: 'manual',
          confidence_score: 1.0,
          verified: true
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upduo-user-mappings'] });
      setSelectedSidebyUser('');
      setUpduoUserId('');
      setUpduoFirstName('');
      setUpduoLastName('');
      toast({
        title: "Success",
        description: "User mapping created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mapping",
        variant: "destructive",
      });
    }
  });

  // Delete mapping mutation
  const deleteMappingMutation = useMutation({
    mutationFn: async (mappingId: string) => {
      const { error } = await supabase
        .from('upduo_user_mappings')
        .delete()
        .eq('id', mappingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upduo-user-mappings'] });
      toast({
        title: "Success",
        description: "User mapping deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete mapping",
        variant: "destructive",
      });
    }
  });

  // Toggle verification mutation
  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ mappingId, verified }: { mappingId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('upduo_user_mappings')
        .update({ verified })
        .eq('id', mappingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upduo-user-mappings'] });
      toast({
        title: "Success",
        description: "Verification status updated",
      });
    }
  });

  const handleCreateMapping = () => {
    if (!selectedSidebyUser || !upduoFirstName || !upduoLastName) {
      toast({
        title: "Error",
        description: "Please select a sideby user and enter both Upduo first and last names",
        variant: "destructive",
      });
      return;
    }

    // Generate a placeholder Upduo user ID if not provided
    const finalUpduoUserId = upduoUserId || `placeholder_${Date.now()}`;

    createMappingMutation.mutate({
      sideby_user_id: selectedSidebyUser,
      upduo_user_id: finalUpduoUserId,
      upduo_first_name: upduoFirstName,
      upduo_last_name: upduoLastName
    });
  };

  const handleFindByName = async () => {
    if (!upduoFirstName || !upduoLastName) {
      toast({
        title: "Error",
        description: "Please enter both first and last name to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingNameSearch(true);
    try {
      const { data, error } = await supabase.functions.invoke('find-upduo-users-by-name', {
        body: {
          firstName: upduoFirstName,
          lastName: upduoLastName,
          limit: 10
        }
      });

      if (error) throw error;

      if (data.success) {
        setNameSearchResults(data.matches || []);
        setIsSearchingByName(true);
        toast({
          title: "Search Complete",
          description: `Found ${data.matches?.length || 0} potential matches`,
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for users",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNameSearch(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    setSelectedSidebyUser(result.sidebyUserId);
    setIsSearchingByName(false);
    setNameSearchResults([]);
    
    toast({
      title: "User Selected",
      description: `Selected ${result.sidebyFirstName} ${result.sidebyLastName}`,
    });
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'manual': return 'default';
      case 'exact_name_match': return 'secondary';
      case 'fuzzy_name_match': return 'outline';
      default: return 'destructive';
    }
  };

  const formatConfidenceScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Create New Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New User Mapping
          </CardTitle>
          <CardDescription>
            Manually associate an Upduo user with a sideby member
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>sideby User</Label>
              <Select value={selectedSidebyUser} onValueChange={setSelectedSidebyUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sideby user" />
                </SelectTrigger>
                <SelectContent>
                  {sidebyUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upduo User ID (Optional)</Label>
              <Input
                placeholder="Leave empty to auto-generate when needed"
                value={upduoUserId}
                onChange={(e) => setUpduoUserId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                User ID can be provided later when processing sessions
              </p>
            </div>
            <div className="space-y-2">
              <Label>Upduo First Name</Label>
              <Input
                placeholder="Enter first name"
                value={upduoFirstName}
                onChange={(e) => setUpduoFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Upduo Last Name</Label>
              <Input
                placeholder="Enter last name"
                value={upduoLastName}
                onChange={(e) => setUpduoLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleFindByName}
              disabled={isLoadingNameSearch || !upduoFirstName || !upduoLastName}
              variant="outline"
              className="flex-1"
            >
              {isLoadingNameSearch ? 'Searching...' : 'Find by Name'}
            </Button>
            <Button 
              onClick={handleCreateMapping}
              disabled={createMappingMutation.isPending}
              className="flex-1"
            >
              {createMappingMutation.isPending ? 'Creating...' : 'Create Mapping'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Name Search Results */}
      {isSearchingByName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results for "{upduoFirstName} {upduoLastName}"
            </CardTitle>
            <CardDescription>
              Select a sideby user to associate with {upduoFirstName} {upduoLastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nameSearchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No matching users found. Try adjusting the name or create a manual mapping.
              </div>
            ) : (
              <div className="space-y-3">
                {nameSearchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong>{result.sidebyFirstName} {result.sidebyLastName}</strong>
                        <Badge variant={result.matchType === 'exact' ? 'default' : 'secondary'}>
                          {result.matchType} match
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(result.confidenceScore * 100)}% confidence
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.sidebyEmail}
                      </div>
                      {result.hasExistingMapping && (
                        <div className="text-xs text-orange-600 mt-1">
                          ⚠ Already mapped to: {result.existingMapping?.upduoFirstName} {result.existingMapping?.upduoLastName}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsSearchingByName(false)}
                    className="w-full"
                  >
                    Cancel Search
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Mappings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Mappings ({mappings?.length || 0})
          </CardTitle>
          <CardDescription>
            Manage existing Upduo user associations
          </CardDescription>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search by name or Upduo ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loadingMappings ? (
            <div className="text-center py-4">Loading mappings...</div>
          ) : !mappings?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No user mappings found
            </div>
          ) : (
            <div className="space-y-4">
              {mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <strong>
                        {mapping.upduo_first_name} {mapping.upduo_last_name}
                      </strong>
                      <Badge variant="outline">
                        {mapping.upduo_user_id}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Associated with: {mapping.profiles?.first_name} {mapping.profiles?.last_name} ({mapping.profiles?.email})
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant={getMethodBadgeVariant(mapping.mapping_method)}>
                        {mapping.mapping_method.replace('_', ' ')}
                      </Badge>
                      <span>Confidence: {formatConfidenceScore(mapping.confidence_score)}</span>
                      <Badge variant={mapping.verified ? "default" : "secondary"}>
                        {mapping.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVerificationMutation.mutate({
                        mappingId: mapping.id,
                        verified: !mapping.verified
                      })}
                      disabled={toggleVerificationMutation.isPending}
                    >
                      {mapping.verified ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMappingMutation.mutate(mapping.id)}
                      disabled={deleteMappingMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
