
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import subscriptionManager from "@/services/subscriptions/subscriptionManager";

interface MatchNote {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useMatchNotes = (matchId: string, userId: string) => {
  const [note, setNote] = useState<MatchNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Input validation helper
  const isValidInput = () => {
    if (!matchId || !userId) {
      console.warn('useMatchNotes: Invalid input - matchId or userId is missing', { matchId, userId });
      return false;
    }
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(matchId) || !uuidRegex.test(userId)) {
      console.warn('useMatchNotes: Invalid UUID format', { matchId, userId });
      return false;
    }
    
    return true;
  };

  const fetchNote = async () => {
    if (!isValidInput()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('useMatchNotes: Fetching note for match:', matchId, 'user:', userId);
      
      const { data, error } = await supabase
        .from('match_user_notes')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('useMatchNotes: Database error fetching note:', error);
        
        // Provide more specific error messages
        let errorMessage = "Failed to load your note for this match";
        if (error.code === 'PGRST116') {
          errorMessage = "Note not found - this is normal if you haven't created one yet";
        } else if (error.message?.includes('permission')) {
          errorMessage = "You don't have permission to view this note";
        } else if (error.message?.includes('network')) {
          errorMessage = "Network error - please check your connection";
        }
        
        throw new Error(errorMessage);
      }
      
      console.log('useMatchNotes: Successfully fetched note:', data ? 'found' : 'not found');
      setNote(data);
    } catch (error: any) {
      console.error('useMatchNotes: Error in fetchNote:', error);
      
      // Only show toast for actual errors, not when note doesn't exist
      if (error.message && !error.message.includes('Note not found')) {
        toast({
          title: "Error",
          description: error.message || "Failed to load your note for this match",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (content: string) => {
    if (!content.trim()) {
      console.warn('useMatchNotes: Attempted to save empty content');
      return;
    }

    if (!isValidInput()) {
      toast({
        title: "Error",
        description: "Invalid match or user information",
        variant: "destructive",
      });
      return;
    }

    // Validate user exists and is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('useMatchNotes: User not authenticated:', authError);
      toast({
        title: "Authentication Error",
        description: "Please log in to save notes",
        variant: "destructive",
      });
      return;
    }

    if (user.id !== userId) {
      console.error('useMatchNotes: User ID mismatch:', { authUserId: user.id, providedUserId: userId });
      toast({
        title: "Error",
        description: "User authentication mismatch",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log('useMatchNotes: Saving note for match:', matchId, 'user:', userId);
      
      if (note) {
        // Update existing note
        const { data, error } = await supabase
          .from('match_user_notes')
          .update({ 
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', note.id)
          .select()
          .single();

        if (error) {
          console.error('useMatchNotes: Error updating note:', error);
          // Check for specific constraint violations
          if (error.code === '23503' && error.message?.includes('user_id')) {
            throw new Error('User account not found. Please refresh and try again.');
          }
          throw error;
        }
        setNote(data);
        console.log('useMatchNotes: Successfully updated note', data);
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('match_user_notes')
          .insert({
            match_id: matchId,
            user_id: userId,
            content: content.trim()
          })
          .select()
          .single();

        if (error) {
          console.error('useMatchNotes: Error creating note:', error);
          // Check for specific constraint violations
          if (error.code === '23503') {
            if (error.message?.includes('user_id')) {
              throw new Error('User account not found. Please refresh and try again.');
            } else if (error.message?.includes('match_id')) {
              throw new Error('Match not found. Please refresh and try again.');
            }
          }
          throw error;
        }
        setNote(data);
        console.log('useMatchNotes: Successfully created note', data);
      }

      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
      
      // Force a refresh to ensure we have the latest data
      await fetchNote();
    } catch (error: any) {
      console.error('useMatchNotes: Error saving note:', error);
      
      let errorMessage = "Failed to save your note. Please try again.";
      if (error.message?.includes('User account not found')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Match not found')) {
        errorMessage = error.message;
      } else if (error.message?.includes('permission') || error.code === '42501') {
        errorMessage = "You don't have permission to save notes for this match";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error - please check your connection and try again";
      } else if (error.code === '23505') {
        errorMessage = "A note already exists. Please refresh and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!note) {
      console.warn('useMatchNotes: Attempted to delete non-existent note');
      return;
    }

    try {
      setSaving(true);
      console.log('useMatchNotes: Deleting note:', note.id);
      
      const { error } = await supabase
        .from('match_user_notes')
        .delete()
        .eq('id', note.id);

      if (error) {
        console.error('useMatchNotes: Error deleting note:', error);
        throw error;
      }
      
      setNote(null);
      console.log('useMatchNotes: Successfully deleted note');
      
      toast({
        title: "Note deleted",
        description: "Your note has been deleted",
      });
    } catch (error: any) {
      console.error('useMatchNotes: Error deleting note:', error);
      
      let errorMessage = "Failed to delete your note. Please try again.";
      if (error.message?.includes('permission')) {
        errorMessage = "You don't have permission to delete this note";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (matchId && userId) {
      console.log('useMatchNotes: Effect triggered, fetching note');
      fetchNote();
      
      // Set up real-time subscription for this specific match and user
      const unsubscribe = subscriptionManager.subscribeToMatchNotes(
        matchId,
        userId,
        () => {
          console.log('useMatchNotes: Real-time update received, refreshing note');
          fetchNote();
        }
      );
      
      unsubscribeRef.current = unsubscribe;
    } else {
      console.log('useMatchNotes: Missing matchId or userId, skipping fetch');
      setLoading(false);
    }

    // Cleanup subscription on unmount or when dependencies change
    return () => {
      if (unsubscribeRef.current) {
        console.log('useMatchNotes: Cleaning up subscription');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [matchId, userId]);

  return {
    note,
    loading,
    saving,
    saveNote,
    deleteNote,
    refreshNote: fetchNote
  };
};
