
import React, { useState, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hardDeleteUserAccount, checkUserDeletionSafety, type SafetyReport } from "@/utils/admin/hardDelete";

interface HardDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName: string;
  onDeleteComplete: () => void;
}

export const HardDeleteDialog = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
  onDeleteComplete
}: HardDeleteDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [safetyReport, setSafetyReport] = useState<SafetyReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load safety report when dialog opens
  useEffect(() => {
    if (open && userId) {
      loadSafetyReport();
    } else if (!open) {
      // Reset state when dialog closes
      setSafetyReport(null);
      setError(null);
      setIsDeleting(false);
    }
  }, [open, userId]);

  const loadSafetyReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Loading safety report for user ${userId}`);
      
      const result = await checkUserDeletionSafety(userId);
      
      if (!result.success) {
        const errorMessage = result.error || "Failed to check deletion safety";
        console.error('Safety check failed:', errorMessage);
        setError(errorMessage);
        return;
      }

      console.log('Safety report loaded:', result.safety_report);
      setSafetyReport(result.safety_report || null);
    } catch (error) {
      console.error('Error loading safety report:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to check deletion safety";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!safetyReport) {
      toast({
        title: "Error",
        description: "Safety report not loaded. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log(`Starting hard delete for user ${userId} (${userEmail})`);
      
      const result = await hardDeleteUserAccount(userId, userEmail);
      
      console.log('Hard delete result:', result);
      
      if (result.success) {
        toast({
          title: "User Successfully Deleted",
          description: `${userName} and all associated data have been permanently removed from the system.`,
        });
        
        // Close dialog first
        onOpenChange(false);
        
        // Then trigger the refresh callback
        onDeleteComplete();
      } else if (result.partialSuccess) {
        toast({
          title: "Partial Deletion",
          description: result.message || "User was partially deleted. Some data may remain.",
          variant: "destructive"
        });
        
        // Close dialog and refresh even for partial success
        onOpenChange(false);
        onDeleteComplete();
      } else {
        const errorMessage = result.error || "Failed to delete user account";
        console.error('Hard delete failed:', errorMessage);
        toast({
          title: "Deletion Failed", 
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error during hard delete:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during deletion";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isLoading || isDeleting) {
      return; // Prevent closing while operations are in progress
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Permanent Account Deletion
          </AlertDialogTitle>
          <AlertDialogDescription>
            Review the deletion impact for <span className="font-semibold">{userName}</span>:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Checking deletion impact...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <h4 className="font-medium mb-2 text-red-800 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Error Loading Safety Information
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {safetyReport && (
            <>
              {/* User Info */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium mb-2">User Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Name:</span> {safetyReport.user_info.name}</div>
                  <div><span className="font-medium">Email:</span> {safetyReport.user_info.email}</div>
                  <div><span className="font-medium">Status:</span> 
                    <Badge variant={safetyReport.user_info.is_admin ? "destructive" : "secondary"} className="ml-1">
                      {safetyReport.user_info.is_admin ? "Admin" : "User"}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Account created:</span> {new Date(safetyReport.user_info.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Data Impact */}
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="font-medium mb-2">Data That Will Be Affected</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Matches:</span> {safetyReport.data_impact.matches}
                  </div>
                  <div>
                    <span className="font-medium">Posts:</span> {safetyReport.data_impact.posts}
                    <div className="text-xs text-gray-600">(will be anonymized)</div>
                  </div>
                  <div>
                    <span className="font-medium">Comments:</span> {safetyReport.data_impact.comments}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {safetyReport.warnings.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <h4 className="font-medium mb-2 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {safetyReport.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ This action will permanently delete all user data and cannot be undone.
                </p>
              </div>
            </>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isLoading || isDeleting}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleConfirmDelete}
            disabled={isLoading || isDeleting || !!error || !safetyReport}
            variant="destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Permanently Delete User'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
