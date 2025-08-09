
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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DeleteTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (strategy: 'cascade' | 'obfuscate' | 'force') => void;
  templateName?: string;
  logCount: number;
  loading?: boolean;
}

export function DeleteTemplateDialog({
  open,
  onOpenChange,
  onConfirm,
  templateName,
  logCount,
  loading = false
}: DeleteTemplateDialogProps) {
  const [deleteStrategy, setDeleteStrategy] = useState<'cascade' | 'obfuscate' | 'force'>('obfuscate');

  const handleConfirm = () => {
    onConfirm(deleteStrategy);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Template</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete this notification template? 
                {templateName && (
                  <span className="block mt-1 font-medium">Template: {templateName}</span>
                )}
              </p>
              
              {logCount > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    This template has been used {logCount} time{logCount !== 1 ? 's' : ''} in notifications.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-800 mb-3">
                      Choose how to handle the notification history:
                    </p>
                    
                    <RadioGroup value={deleteStrategy} onValueChange={(value) => setDeleteStrategy(value as any)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="obfuscate" id="obfuscate" />
                        <Label htmlFor="obfuscate" className="text-sm">
                          <strong>Obfuscate (Recommended)</strong> - Keep notification history but remove template reference
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cascade" id="cascade" />
                        <Label htmlFor="cascade" className="text-sm">
                          <strong>Delete All</strong> - Delete template and all related notification history
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="force" id="force" />
                        <Label htmlFor="force" className="text-sm">
                          <strong>Force Delete</strong> - Attempt deletion without handling dependencies (may fail)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-destructive">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Template'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
