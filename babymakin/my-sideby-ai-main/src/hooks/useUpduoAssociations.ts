import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export const useUpduoAssociations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch association by Upduo user details
  const getAssociation = (firstName: string, lastName: string, upduoUserId?: string) => {
    return useQuery({
      queryKey: ['upduo-association', firstName, lastName, upduoUserId],
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
          `);

        if (upduoUserId) {
          query = query.eq('upduo_user_id', upduoUserId);
        } else {
          query = query
            .eq('upduo_first_name', firstName)
            .eq('upduo_last_name', lastName);
        }

        const { data, error } = await query.limit(1);
        if (error) throw error;
        
        if (!data || data.length === 0) return null;
        
        const result = data[0];
        return {
          id: result.id,
          sideby_user_id: result.sideby_user_id,
          upduo_user_id: result.upduo_user_id,
          upduo_first_name: result.upduo_first_name,
          upduo_last_name: result.upduo_last_name,
          confidence_score: result.confidence_score,
          mapping_method: result.mapping_method,
          verified: result.verified,
          created_at: result.created_at,
          profiles: result.profiles as any // Handle the relationship data
        } as UpduoUserMapping;
      },
      enabled: !!(firstName && lastName),
    });
  };

  // Fetch all sideby profiles for selection
  const { data: sidebyProfiles } = useQuery({
    queryKey: ['sideby-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');
      if (error) throw error;
      return data as SidebyProfile[];
    }
  });

  // Create new association
  const createAssociation = useMutation({
    mutationFn: async (mapping: {
      sideby_user_id: string;
      upduo_user_id?: string;
      upduo_first_name: string;
      upduo_last_name: string;
    }) => {
      const { error } = await supabase
        .from('upduo_user_mappings')
        .insert({
          ...mapping,
          upduo_user_id: mapping.upduo_user_id || `placeholder_${Date.now()}`,
          mapping_method: 'manual',
          confidence_score: 1.0,
          verified: true
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upduo-association'] });
      toast({
        title: "Success",
        description: "Association created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create association",
        variant: "destructive",
      });
    }
  });

  // Search for potential matches by name
  const searchByName = useMutation({
    mutationFn: async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
      const { data, error } = await supabase.functions.invoke('find-upduo-users-by-name', {
        body: {
          firstName,
          lastName,
          limit: 5
        }
      });

      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for users",
        variant: "destructive",
      });
    }
  });

  return {
    getAssociation,
    sidebyProfiles,
    createAssociation,
    searchByName,
  };
};