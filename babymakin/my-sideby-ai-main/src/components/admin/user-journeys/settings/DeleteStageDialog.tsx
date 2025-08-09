
import React, { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { JourneyStageConfig } from "./hooks/useJourneyStageSettings";

interface DeleteStageDialogProps {
  stage: JourneyStageConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageDeleted: () => void;
}

export const DeleteStageDialog: React.FC<DeleteStageDialogProps> = ({
  stage,
  open,
  onOpenChange,
  onStageDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!stage) return;

    setLoading(true);
    try {
      // Soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from('journey_stage_config')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', stage.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Journey stage deleted successfully",
      });

      onStageDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting journey stage:', error);
      toast({
        title: "Error",
        description: "Failed to delete journey stage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!stage) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Journey Stage</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the journey stage "{stage.label}"? 
            This action cannot be undone and may affect users currently in this stage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deleting...' : 'Delete Stage'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
