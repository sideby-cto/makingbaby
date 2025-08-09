
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Type for the response from the completely_delete_match function
interface DeleteMatchResponse {
  success: boolean;
  error?: string;
  message?: string;
  deletions?: Record<string, number>;
}

export const useMatchDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteMatch = async (matchId: string, userId: string) => {
    setIsDeleting(true);
    
    try {
      // First verify that the user is part of this match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id, status')
        .eq('id', matchId)
        .single();

      if (matchError) {
        throw new Error('Match not found');
      }

      if (!match) {
        throw new Error('Match not found');
      }

      // Check if user is part of this match
      if (match.user1_id !== userId && match.user2_id !== userId) {
        throw new Error('You are not authorized to delete this match');
      }

      // Check if match is already completed
      if (match.status === 'completed') {
        throw new Error('Cannot delete a completed match');
      }

      // Call the Supabase function to completely delete the match
      const { data, error } = await supabase.rpc('completely_delete_match', {
        match_id_param: matchId
      });

      if (error) {
        throw error;
      }

      // Safely convert the response by first converting to unknown
      const response = data as unknown as DeleteMatchResponse;

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to delete match');
      }

      toast({
        title: "Match deleted",
        description: "The match and all associated messages have been deleted.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting match:', error);
      
      toast({
        title: "Error deleting match",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteMatch,
    isDeleting
  };
};
