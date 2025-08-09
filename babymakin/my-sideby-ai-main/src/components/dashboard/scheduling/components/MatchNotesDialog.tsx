
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save, Trash2, Loader2, Eye, AlertCircle } from "lucide-react";
import { useMatchNotes } from "@/hooks/useMatchNotes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MatchNotesDialogProps {
  matchId: string;
  userId: string;
  partnerName?: string;
}

export const MatchNotesDialog = ({ matchId, userId, partnerName }: MatchNotesDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { note, loading, saving, saveNote, deleteNote } = useMatchNotes(matchId, userId);

  // Input validation
  const hasValidInputs = matchId && userId;

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setHasUnsavedChanges(false);
    } else {
      setContent("");
      setHasUnsavedChanges(false);
    }
  }, [note]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent.trim() !== (note?.content || ""));
  };

  const handleSave = async () => {
    if (content.trim()) {
      const previousNote = note;
      const previousContent = content;
      
      try {
        await saveNote(content);
        // Only clear unsaved changes if the save was successful
        // The note state will be updated by the hook after successful save
        console.log('MatchNotesDialog: Save completed successfully');
      } catch (error) {
        console.error('MatchNotesDialog: Save failed, maintaining unsaved changes state');
        // Keep the unsaved changes indicator since save failed
        // The state will remain as hasUnsavedChanges = true
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote();
      setContent("");
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('MatchNotesDialog: Delete failed');
      // Error is already handled in the hook
    }
  };

  // Additional effect to sync unsaved changes after note updates
  useEffect(() => {
    if (note && content !== note.content) {
      setHasUnsavedChanges(content.trim() !== note.content.trim());
    } else if (!note && content.trim()) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [note, content]);

  // Don't render if we don't have valid inputs
  if (!hasValidInputs) {
    console.warn('MatchNotesDialog: Missing required props', { matchId, userId });
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {note ? (
          <Button variant="default" size="sm" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Eye className="h-4 w-4" />
            View Note
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Add Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Personal Note
            {partnerName && (
              <span className="text-sm text-muted-foreground font-normal">
                - Match with {partnerName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading your note...</span>
            </div>
          ) : (
            <>
              <div>
                <Textarea
                  placeholder="Add your personal notes about this match... What did you learn? What went well? Any insights or reflections?"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[200px] resize-none"
                  disabled={saving}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  This note is private and only visible to you.
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={!hasUnsavedChanges || saving || !content.trim()}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save Note"}
                  </Button>
                  
                  {note && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={saving}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this note? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Note
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                {hasUnsavedChanges && (
                  <span className="text-sm text-amber-600">
                    Unsaved changes
                  </span>
                )}
              </div>
              
              {note && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Last updated: {new Date(note.updated_at).toLocaleDateString()} at {new Date(note.updated_at).toLocaleTimeString()}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
