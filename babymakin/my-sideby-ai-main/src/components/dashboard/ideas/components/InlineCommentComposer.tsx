
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";

interface InlineCommentComposerProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  userAvatar?: string;
  userName?: string;
  isSubmitting?: boolean;
}

export const InlineCommentComposer = ({
  onSubmit,
  onCancel,
  placeholder = "Add your thoughts...",
  userAvatar,
  userName = "You",
  isSubmitting = false
}: InlineCommentComposerProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    try {
      await onSubmit(content);
      setContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-sideby-orange-100 text-sideby-orange-700 text-xs">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[80px] resize-none border-gray-200 focus:border-sideby-orange-300 focus:ring-sideby-orange-200"
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              autoFocus
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-xs text-gray-500 order-2 sm:order-1">
                Tip: Press Cmd/Ctrl + Enter to post quickly
              </p>
              <div className="flex gap-2 order-1 sm:order-2 self-end sm:self-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-1 bg-sideby-orange-500 hover:bg-sideby-orange-600"
                >
                  <Send className="h-3 w-3" />
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
