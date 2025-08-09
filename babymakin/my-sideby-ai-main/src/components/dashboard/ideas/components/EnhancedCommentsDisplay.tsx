
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineCommentComposer } from "./InlineCommentComposer";
import { Heart, MessageCircle, ThumbsUp, Users } from "lucide-react";
import { Comment } from "../hooks/types/comments";

interface EnhancedCommentsDisplayProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onReact: (commentId: string, reactionType: string) => Promise<void>;
  onMarkHelpful: (commentId: string) => Promise<void>;
  currentUserAvatar?: string;
  currentUserName?: string;
  isSubmitting?: boolean;
}

export const EnhancedCommentsDisplay = ({
  comments,
  onAddComment,
  onReact,
  onMarkHelpful,
  currentUserAvatar,
  currentUserName = "You",
  isSubmitting = false
}: EnhancedCommentsDisplayProps) => {
  const [showComposer, setShowComposer] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitComment = async (content: string) => {
    await onAddComment(content);
    setShowComposer(false);
  };

  return (
    <div className="space-y-6">
      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage 
                    src={comment.profiles?.avatar_url} 
                    alt={`${comment.profiles?.first_name} ${comment.profiles?.last_name}`}
                  />
                  <AvatarFallback className="bg-sideby-orange-100 text-sideby-orange-700 text-xs">
                    {comment.profiles?.first_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm text-gray-900">
                      {comment.profiles?.first_name} {comment.profiles?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    {comment.content}
                  </p>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-gray-100"
                      onClick={() => onReact(comment.id, 'like')}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Like
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-gray-100"
                      onClick={() => onReact(comment.id, 'heart')}
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      Love
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-green-50 hover:text-green-700"
                      onClick={() => onMarkHelpful(comment.id)}
                    >
                      <Badge variant="outline" className="h-5 px-1 text-xs border-green-200 text-green-700">
                        Helpful
                      </Badge>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No comments yet</p>
          <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Add Comment Section */}
      <div className="border-t border-gray-200 pt-4">
        {showComposer ? (
          <InlineCommentComposer
            onSubmit={handleSubmitComment}
            onCancel={() => setShowComposer(false)}
            placeholder="Share your thoughts about this idea..."
            userAvatar={currentUserAvatar}
            userName={currentUserName}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUserAvatar} alt={currentUserName} />
              <AvatarFallback className="bg-sideby-orange-100 text-sideby-orange-700 text-xs">
                {currentUserName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              className="flex-1 justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              onClick={() => setShowComposer(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting comment..." : "Add a comment..."}
            </Button>
          </div>
        )}
      </div>

      {/* Community Engagement Hint */}
      <div className="bg-gradient-to-r from-sideby-blue-50 to-sideby-teal-50 rounded-lg p-4 border border-sideby-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-sideby-blue-600" />
          <p className="text-sm font-semibold text-sideby-blue-800">Community Discussion</p>
        </div>
        <p className="text-sm text-sideby-blue-700 leading-relaxed">
          Share your thoughts, ask questions, or provide feedback. Your engagement helps build a stronger learning community!
        </p>
      </div>
    </div>
  );
};
