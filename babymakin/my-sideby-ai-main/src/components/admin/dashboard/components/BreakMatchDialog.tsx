import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BreakMatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  user1Name: string;
  user2Name: string;
  onMatchBroken: () => void;
}

export const BreakMatchDialog: React.FC<BreakMatchDialogProps> = ({
  isOpen,
  onClose,
  matchId,
  user1Name,
  user2Name,
  onMatchBroken
}) => {
  const [isBreaking, setIsBreaking] = useState(false);
  const { toast } = useToast();

  const handleBreakMatch = async () => {
    try {
      setIsBreaking(true);

      // Update match status to broken
      const { error: updateError } = await supabase
        .from('matches')
        .update({ 
          status: 'broken',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // Get match details for notifications
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // Create notifications for both users
      const notifications = [
        {
          user_id: match.user1_id,
          type: 'match_broken',
          title: 'Match Ended',
          content: `Your learning connection with ${user2Name} has been ended by an administrator.`,
          data: { match_id: matchId }
        },
        {
          user_id: match.user2_id,
          type: 'match_broken',
          title: 'Match Ended',
          content: `Your learning connection with ${user1Name} has been ended by an administrator.`,
          data: { match_id: matchId }
        }
      ];

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        // Don't fail the whole operation for notification errors
      }

      toast({
        title: "Match Broken",
        description: `The match between ${user1Name} and ${user2Name} has been ended.`,
      });

      onMatchBroken();
      onClose();
    } catch (error) {
      console.error('Error breaking match:', error);
      toast({
        title: "Error",
        description: "Failed to break the match. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBreaking(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Break Match</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to break the match between {user1Name} and {user2Name}? 
            This action will end their learning connection and notify both users.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBreaking}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBreakMatch} 
            disabled={isBreaking}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isBreaking ? "Breaking..." : "Break Match"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};