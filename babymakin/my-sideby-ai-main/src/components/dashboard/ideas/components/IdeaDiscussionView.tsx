
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIdeaDiscussions, IdeaDiscussionMessage } from "../hooks/useIdeaDiscussions";

interface IdeaDiscussionViewProps {
  ideaId: string;
}

export const IdeaDiscussionView = ({ ideaId }: IdeaDiscussionViewProps) => {
  const { supabaseUser } = useAuth();
  const { messages, isLoading, isSubmitting, addMessage } = useIdeaDiscussions(ideaId);
  const [newMessage, setNewMessage] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const handleSubmit = async () => {
    if (!newMessage.trim()) return;

    const success = await addMessage(newMessage);
    if (success) {
      setNewMessage("");
      setShowComposer(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-sideby-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages List */}
      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message: IdeaDiscussionMessage) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage 
                  src={message.profiles?.avatar_url || undefined} 
                  alt={`${message.profiles?.first_name} ${message.profiles?.last_name}`}
                />
                <AvatarFallback className="bg-sideby-orange-100 text-sideby-orange-700 text-sm">
                  {message.sender_type === 'admin' ? 'A' : message.profiles?.first_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-sideby-text-primary">
                    {message.sender_type === 'admin' 
                      ? 'sideby Team' 
                      : `${message.profiles?.first_name} ${message.profiles?.last_name}`
                    }
                  </p>
                  <p className="text-xs text-sideby-text-muted">
                    {formatDate(message.created_at)}
                  </p>
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.sender_type === 'admin' 
                    ? 'bg-purple-50 border border-purple-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No messages yet</p>
          <p className="text-gray-400 text-sm">Start the discussion by sharing your thoughts!</p>
        </div>
      )}

      {/* Message Composer */}
      <div className="border-t border-gray-200 pt-4">
        {showComposer ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={supabaseUser?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-sideby-orange-100 text-sideby-orange-700 text-xs">
                  {supabaseUser?.user_metadata?.full_name?.charAt(0) || 'Y'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts about this idea..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[80px] resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowComposer(false);
                  setNewMessage("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !newMessage.trim()}
                className="flex items-center gap-1"
              >
                {isSubmitting ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={supabaseUser?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-sideby-orange-100 text-sideby-orange-700 text-xs">
                {supabaseUser?.user_metadata?.full_name?.charAt(0) || 'Y'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              className="flex-1 justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              onClick={() => setShowComposer(true)}
            >
              Add your thoughts to the discussion...
            </Button>
          </div>
        )}
      </div>

      {/* Community Engagement Hint */}
      <div className="bg-gradient-to-r from-sideby-blue-50 to-sideby-teal-50 rounded-lg p-4 border border-sideby-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-sideby-blue-600" />
          <p className="text-sm font-semibold text-sideby-blue-800">Structured Discussion</p>
        </div>
        <p className="text-sm text-sideby-blue-700 leading-relaxed">
          This is your private space to develop and refine your ideas. Share thoughts, ask questions, and explore different perspectives!
        </p>
      </div>
    </div>
  );
};
