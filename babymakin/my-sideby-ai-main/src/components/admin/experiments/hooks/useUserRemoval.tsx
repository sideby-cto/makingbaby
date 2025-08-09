
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/types/profile";

export function useUserRemoval() {
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRemoveUser = async (userId: string, email: string) => {
    try {
      setRemovingUserId(userId);
      
      // Show processing toast
      toast({
        title: "Removing user...",
        description: `Removing ${email} from sideby`,
      });
      
      // Soft delete approach - update the profile status to 'deleted' and set deleted_at timestamp
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          status: 'deleted', 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', userId);
        
      if (profileError) throw profileError;

      // Update community memberships to mark as deleted
      const { error: membershipError } = await supabase
        .from('community_members')
        .update({ 
          status: 'deleted', 
          deleted_at: new Date().toISOString() 
        })
        .eq('user_id', userId);
        
      if (membershipError) console.warn('Error updating community memberships:', membershipError);

      // Update user roles to mark as deleted
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ 
          status: 'deleted', 
          deleted_at: new Date().toISOString() 
        })
        .eq('user_id', userId);
        
      if (roleError) console.warn('Error updating user roles:', roleError);

      // Update pacing preferences to mark as deleted
      const { error: pacingError } = await supabase
        .from('user_pacing_preferences')
        .update({ 
          status: 'deleted', 
          deleted_at: new Date().toISOString() 
        })
        .eq('user_id', userId);
        
      if (pacingError) console.warn('Error updating pacing preferences:', pacingError);

      // Cancel active matches
      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "cancelled" })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq("status", "active");
        
      if (matchError) console.warn('Error cancelling matches:', matchError);

      // NOTE: The database trigger we just created will automatically update profile_experiments
      // However, we'll update the local cache immediately for responsiveness
      
      // Immediately remove this user from the local profiles list
      queryClient.setQueryData(['profiles'], (oldData: Profile[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(profile => profile.id !== userId);
      });
      
      // Immediately update any experiments for this user in the cache
      ['stance_from_welcome', 'guts_vs_fear', 'stance'].forEach(expType => {
        queryClient.setQueryData(['profile-experiments', expType], (oldData: any[] | undefined) => {
          if (!oldData) return [];
          return oldData.map(exp => 
            exp.user_id === userId 
              ? { ...exp, status: 'deleted', is_deleted: true } 
              : exp
          );
        });
      });
      
      // Invalidate queries to force refetches where needed
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile-experiments'] });
      
      toast({
        title: "User removed successfully",
        description: `${email} has been removed from sideby`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error removing user",
        description: "There was a problem removing this user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingUserId(null);
    }
  };

  return {
    removingUserId,
    handleRemoveUser
  };
}
