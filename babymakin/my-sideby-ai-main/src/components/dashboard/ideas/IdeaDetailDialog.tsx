import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock } from "lucide-react";
import { IdeaContent } from "./components/IdeaContent";
import { IdeaMassageChat } from "./components/IdeaMassageChat";
import { SavedItem } from "./types";
import { useOptimisticSavedIdeas } from "./hooks/useOptimisticSavedIdeas";
import { useAuth } from "@/hooks/useAuth";
import { useMemoryLeakProtection } from "@/hooks/useMemoryLeakProtection";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

interface IdeaDetailDialogProps {
  selectedItem: SavedItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IdeaDetailDialog = React.memo(({ 
  selectedItem, 
  open, 
  onOpenChange
}: IdeaDetailDialogProps) => {
  const { user } = useAuth();
  
  const { updateContent, isUpdating } = useOptimisticSavedIdeas(user?.id);
  const { safeSetTimeout } = useMemoryLeakProtection();
  const { startMeasure, endMeasure } = usePerformanceMonitor('IdeaDetailDialog');

  // Memoize formatted date to prevent recalculation
  const formattedDate = useMemo(() => {
    return selectedItem ? new Date(selectedItem.created_at).toLocaleDateString() : '';
  }, [selectedItem?.created_at]);

  // Handle content update
  const handleContentUpdate = useCallback(async (newContent: string) => {
    if (!selectedItem || isUpdating) return;
    
    try {
      updateContent({
        itemId: selectedItem.id,
        field: 'content',
        value: newContent
      });
    } catch (error) {
      console.error('IdeaDetailDialog: Error updating content:', error);
    }
  }, [selectedItem?.id, isUpdating, updateContent]);

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleDialogClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleDialogClose]);

  // Early return if no selected item to prevent unnecessary rendering
  if (!selectedItem) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col" style={{ backgroundColor: '#FBF6E3' }}>
        {/* Header - Fixed */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-sideby-orange-100">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-sideby-text-primary tracking-wide mb-2">
                  Idea Details
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-sideby-text-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Content Section */}
            <div className="bg-gradient-to-r from-sideby-orange-50 to-sideby-blue-50 rounded-xl p-4 sm:p-6 border border-sideby-orange-200">
              <IdeaContent content={selectedItem.content} truncate={false} />
            </div>

            {/* Massage Chat Section */}
            <IdeaMassageChat 
              selectedItem={selectedItem}
              onContentUpdate={handleContentUpdate}
            />

            {/* Keyboard Shortcuts Help */}
            <div className="text-xs text-sideby-text-muted text-center space-y-1">
              <p>Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

IdeaDetailDialog.displayName = 'IdeaDetailDialog';