
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BetaUser } from './types';

export const useBetaUsers = () => {
  const [betaUsers, setBetaUsers] = useState<BetaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const { toast } = useToast();

  const fetchBetaUsers = async () => {
    try {
      setLoading(true);
      
      // First get all beta users
      const { data: betaData, error: betaError } = await supabase
        .from('beta_users')
        .select('*');
      
      if (betaError) {
        console.error('Error fetching beta users:', betaError);
        throw betaError;
      }

      if (!betaData || betaData.length === 0) {
        setBetaUsers([]);
        setLoading(false);
        return;
      }
      
      // Get the user IDs from beta users
      const userIds = betaData.map(user => user.user_id);
      
      // Now fetch profiles for those user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      // Create a map of profiles by ID for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      // Combine data
      const transformedData = betaData.map(betaUser => {
        const profile = profilesMap.get(betaUser.user_id) || {};
        return {
          id: betaUser.id,
          user_id: betaUser.user_id,
          features: betaUser.features || [],
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name
        };
      });
      
      setBetaUsers(transformedData);
    } catch (error) {
      console.error('Error in fetchBetaUsers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load beta users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addBetaUser = async (email: string) => {
    if (!email) return;
    
    try {
      setAddingUser(true);
      
      // First get user ID from email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        throw new Error('User not found with that email address. They must register first.');
      }
      
      // Check if user is already in beta program
      const { data: existingBeta } = await supabase
        .from('beta_users')
        .select('id')
        .eq('user_id', userData.id)
        .single();
        
      if (existingBeta) {
        toast({
          title: 'Info',
          description: 'User is already in beta program',
          variant: 'default',
        });
        return;
      }
      
      // Add user to beta program using RPC function
      const { error } = await supabase
        .rpc('admin_add_beta_user', { 
          user_id: userData.id,
          features_array: ['newUserFlowBeta']
        });
      
      if (error) {
        console.error('Error adding beta user:', error);
        throw new Error('Failed to add user to beta program. You may not have sufficient permissions.');
      }
      
      toast({
        title: 'Success',
        description: 'User added to beta program',
        variant: 'default',
      });
      
      fetchBetaUsers();
    } catch (error: any) {
      console.error('Error adding beta user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add user to beta program',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setAddingUser(false);
    }
  };

  const removeBetaUser = async (id: string) => {
    try {
      // Use RPC function to bypass RLS
      const { error } = await supabase
        .rpc('admin_remove_beta_user', { beta_user_id: id });
      
      if (error) {
        console.error('Error removing beta user:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove user from beta program. You may not have sufficient permissions.',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Success',
        description: 'User removed from beta program',
        variant: 'default',
      });
      
      fetchBetaUsers();
    } catch (error) {
      console.error('Error removing beta user:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove user from beta program',
        variant: 'destructive',
      });
    }
  };

  const refreshLists = () => {
    fetchBetaUsers();
  };

  useEffect(() => {
    fetchBetaUsers();
    
    // Set up real-time subscriptions
    const betaUsersChannel = supabase
      .channel('beta-users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'beta_users' },
        () => {
          fetchBetaUsers();
        }
      )
      .subscribe();
      
    return () => {
      // Clean up subscriptions on unmount
      supabase.removeChannel(betaUsersChannel);
    };
  }, []);

  return {
    betaUsers,
    loading,
    addingUser,
    addBetaUser,
    removeBetaUser,
    refreshLists
  };
};
