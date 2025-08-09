
import React, { useState } from "react";
import { IdeasFilter } from "./IdeasFilter";
import { EmptyIdeasState } from "./EmptyIdeasState";
import { useCommunityIdeas } from "./hooks/useCommunityIdeas";
import { useIdeaComments } from "./hooks/useIdeaComments";
import { CommunityIdeaItem } from "./components/CommunityIdeaItem";
import { IdeaItem } from "./IdeaItem";
import { IdeaDetailDialog } from "./IdeaDetailDialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Sparkles, Users } from "lucide-react";
import { useSavedIdeas } from "./hooks/useSavedIdeas";

interface IntegratedIdeasViewProps {
  userId: string;
}

const IntegratedIdeasView = ({ userId }: IntegratedIdeasViewProps) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  
  const { combinedItems, isLoading } = useCommunityIdeas(userId);
  const { handleExcitementChange, handleAlignmentChange } = useSavedIdeas(userId);
  
  const ideaIds = combinedItems
    .filter(item => item.source_type === 'personal')
    .map(item => item.id);
  const { comments } = useIdeaComments(ideaIds);

  // Handle rating changes - only for personal ideas
  const handleExcitementRating = async (e: React.MouseEvent, level: number, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const item = combinedItems.find(i => i.id === itemId);
    if (item?.source_type === 'personal') {
      await handleExcitementChange(level, itemId);
    }
  };

  const handleAlignmentRating = async (e: React.MouseEvent, level: number, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const item = combinedItems.find(i => i.id === itemId);
    if (item?.source_type === 'personal') {
      await handleAlignmentChange(level, itemId);
    }
  };

  // Calculate discussion metrics for personal ideas only
  const getDiscussionStats = () => {
    const personalItems = combinedItems.filter(item => item.source_type === 'personal');
    const totalComments = Object.values(comments).flat().length;
    const ideasWithComments = Object.keys(comments).filter(id => comments[id]?.length > 0).length;
    const recentlyActive = Object.entries(comments).filter(([_, ideaComments]) => {
      if (!ideaComments?.length) return false;
      const latestComment = ideaComments[ideaComments.length - 1];
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      return new Date(latestComment.created_at) > twoDaysAgo;
    }).length;

    return { totalComments, ideasWithComments, recentlyActive, personalCount: personalItems.length };
  };

  const { totalComments, ideasWithComments, recentlyActive, personalCount } = getDiscussionStats();
  const communityCount = combinedItems.filter(item => item.source_type === 'community').length;

  // Filter logic
  const filteredItems = combinedItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "personal-only") return item.source_type === 'personal';
    if (filter === "community-only") return item.source_type === 'community';
    if (filter === "excitement-high") return item.source_type === 'personal' && (item as any).excitement_level >= 2;
    if (filter === "alignment-high") return item.source_type === 'personal' && (item as any).alignment_level >= 2;
    if (filter === "unrated") return item.source_type === 'personal' && !(item as any).excitement_level && !(item as any).alignment_level;
    if (filter === "with-comments") return item.source_type === 'personal' && comments[item.id]?.length > 0;
    return true;
  });

  // Determine if an idea has active discussion
  const hasActiveDiscussion = (ideaId: string) => {
    const ideaComments = comments[ideaId] || [];
    if (!ideaComments.length) return false;
    
    const latestComment = ideaComments[ideaComments.length - 1];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return new Date(latestComment.created_at) > twoDaysAgo;
  };

  const getRecentComment = (ideaId: string) => {
    const ideaComments = comments[ideaId] || [];
    return ideaComments.length > 0 ? ideaComments[ideaComments.length - 1] : null;
  };

  const handleViewItem = (item: any) => {
    // Only allow viewing details for personal ideas (community posts are read-only inspiration)
    if (item.source_type === 'personal') {
      setSelectedItem(item);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your ideas and community insights...</p>
        </div>
      </div>
    );
  }

  if (combinedItems.length === 0) {
    return <EmptyIdeasState />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-gradient-to-r from-[#FBF3E3] to-[#1A40F4]/5 rounded-lg p-4 border border-[#F87201]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-[#401612] mb-1">Your Learning Hub</h3>
            <p className="text-sm text-[#401612]/70">
              {personalCount} personal ideas, {communityCount} community insights
              {totalComments > 0 && `, ${totalComments} discussions`}
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="secondary" className="bg-[#F35EB3]/10 text-[#F35EB3] border-[#F35EB3]/20">
              <Users className="h-3 w-3 mr-1" />
              {personalCount} yours
            </Badge>
            <Badge variant="secondary" className="bg-[#1A40F4]/10 text-[#1A40F4] border-[#1A40F4]/20">
              <Sparkles className="h-3 w-3 mr-1" />
              {communityCount} AI insights
            </Badge>
            {totalComments > 0 && (
              <Badge variant="secondary" className="bg-[#3F937B]/10 text-[#3F937B] border-[#3F937B]/20">
                <MessageSquare className="h-3 w-3 mr-1" />
                {ideasWithComments} with comments
              </Badge>
            )}
            {recentlyActive > 0 && (
              <Badge variant="secondary" className="bg-[#FFC000]/10 text-[#8F0059] border-[#FFC000]/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                {recentlyActive} recently active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filter */}
      <IdeasFilter 
        filter={filter} 
        onFilterChange={setFilter}
        showDiscussionFilters={true}
        showSourceFilters={true}
      />

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          if (item.source_type === 'community') {
            return (
              <CommunityIdeaItem
                key={item.id}
                item={item}
                onView={handleViewItem}
                comments={[]}
                hasActiveDiscussion={false}
              />
            );
          }

          return (
            <IdeaItem
              key={item.id}
              item={item}
              onView={handleViewItem}
              onExcitementChange={handleExcitementRating}
              onAlignmentChange={handleAlignmentRating}
              comments={comments[item.id] || []}
              recentComment={getRecentComment(item.id)}
              hasActiveDiscussion={hasActiveDiscussion(item.id)}
            />
          );
        })}
      </div>

      {/* Detail Dialog - only for personal ideas */}
      {selectedItem && selectedItem.source_type === 'personal' && (
        <IdeaDetailDialog
          selectedItem={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default IntegratedIdeasView;
