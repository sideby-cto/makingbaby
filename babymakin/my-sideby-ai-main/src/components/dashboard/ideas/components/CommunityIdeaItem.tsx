
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Sparkles, Users, BookOpen } from "lucide-react";
import { IdeaContent } from "./IdeaContent";

interface CommunityIdeaItemProps {
  item: {
    id: string;
    content: string;
    created_at: string;
    source_type: 'personal' | 'community';
    author?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  };
  onView: (item: any) => void;
  comments?: any[];
  hasActiveDiscussion?: boolean;
}

export const CommunityIdeaItem = ({
  item,
  onView,
  comments = [],
  hasActiveDiscussion = false,
}: CommunityIdeaItemProps) => {
  const isCommunityPost = item.source_type === 'community';
  const commentCount = comments.length;

  // Use brand colors for community posts
  const cardStyle = isCommunityPost 
    ? "border-[#1A40F4] bg-gradient-to-br from-[#1A40F4]/5 to-[#F35EB3]/5" 
    : hasActiveDiscussion 
      ? 'ring-2 ring-blue-200 bg-blue-50/30' 
      : '';

  const getAuthorName = () => {
    if (isCommunityPost && item.author) {
      return `${item.author.first_name || ''} ${item.author.last_name || ''}`.trim() || 'AI Assistant';
    }
    return null;
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow duration-200 ${cardStyle} flex flex-col h-full`}>
      <div className="flex flex-col h-full">
        {/* Header with source indicators */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
            {isCommunityPost && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-[#1A40F4]/10 text-[#1A40F4] border-[#1A40F4]/20"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Educational Leadership
              </Badge>
            )}
            {hasActiveDiscussion && !isCommunityPost && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Users className="h-3 w-3 mr-1" />
                Active Discussion
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(item)}
            className={isCommunityPost 
              ? "text-[#1A40F4] hover:text-[#1A40F4]/80 hover:bg-[#1A40F4]/10" 
              : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            }
          >
            <Eye className="h-4 w-4 mr-1" />
            {isCommunityPost ? 'Learn More' : 'View'}
          </Button>
        </div>

        {/* Author info for community posts */}
        {isCommunityPost && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-[#FBF3E3]/50 rounded-lg border border-[#F87201]/20">
            <BookOpen className="h-4 w-4 text-[#F87201]" />
            <span className="text-sm font-medium text-[#401612]">
              Shared by {getAuthorName()}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-grow space-y-3 mb-4">
          <IdeaContent content={item.content} />
        </div>

        {/* Footer for community posts */}
        {isCommunityPost && (
          <div className="pt-3 border-t border-[#1A40F4]/20 mt-auto">
            <div className="flex items-center justify-between text-xs text-[#1A40F4]/70">
              <span>💡 Educational insight for your inspiration</span>
              <Badge variant="outline" className="border-[#1A40F4]/30 text-[#1A40F4]">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
