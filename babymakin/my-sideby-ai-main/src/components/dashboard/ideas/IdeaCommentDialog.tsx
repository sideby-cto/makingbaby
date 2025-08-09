
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export interface IdeaCommentDialogProps {
  ideaId: string;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  comment: string;
  setComment: Dispatch<SetStateAction<string>>;
  onComment: () => Promise<void>;
}

export const IdeaCommentDialog = ({
  ideaId,
  open,
  onOpenChange,
  comment,
  setComment,
  onComment
}: IdeaCommentDialogProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    await onComment();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Add a Comment
          </DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or insights about this idea.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What are your thoughts on this idea? How might you use or adapt it?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] resize-none"
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Tip: Press Cmd/Ctrl + Enter to post quickly
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!comment.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
