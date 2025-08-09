
import React, { useState, useEffect } from "react";
import { IdeasFilter } from "./IdeasFilter";
import { EmptyIdeasState } from "./EmptyIdeasState";
import { usePersonalIdeas } from "./hooks/usePersonalIdeas";
import { IdeaItem } from "./IdeaItem";
import { IdeaDetailDialog } from "./IdeaDetailDialog";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { useSavedIdeas } from "./hooks/useSavedIdeas";

interface SimplifiedIdeasViewProps {
  userId: string;
}

const SimplifiedIdeasView = ({ userId }: SimplifiedIdeasViewProps) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  
  console.log('SimplifiedIdeasView: Component render with userId:', {
    userId,
    userIdType: typeof userId,
    timestamp: new Date().toISOString()
  });
  
  const { personalIdeas, isLoading, refreshIdeas } = usePersonalIdeas(userId);
  const { handleExcitementChange, handleAlignmentChange } = useSavedIdeas(userId);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log('SimplifiedIdeasView: Hook data updated:', {
      userId,
      personalIdeasCount: personalIdeas.length,
      isLoading
    });
  }, [userId, personalIdeas, isLoading]);

  // Handle rating changes with proper async handling and UI updates
  const handleExcitementRating = async (e: React.MouseEvent, level: number, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('SimplifiedIdeasView: Handling excitement rating:', { level, itemId, userId });
    
    try {
      await handleExcitementChange(level, itemId);
      console.log('SimplifiedIdeasView: Excitement rating updated successfully');
      // Refresh the ideas to show updated ratings
      await refreshIdeas();
    } catch (error) {
      console.error('SimplifiedIdeasView: Error updating excitement rating:', error);
    }
  };

  const handleAlignmentRating = async (e: React.MouseEvent, level: number, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('SimplifiedIdeasView: Handling alignment rating:', { level, itemId, userId });
    
    try {
      await handleAlignmentChange(level, itemId);
      console.log('SimplifiedIdeasView: Alignment rating updated successfully');
      // Refresh the ideas to show updated ratings
      await refreshIdeas();
    } catch (error) {
      console.error('SimplifiedIdeasView: Error updating alignment rating:', error);
    }
  };

  // Filter logic
  const filteredItems = personalIdeas.filter(item => {
    if (filter === "all") return true;
    if (filter === "excitement-high") return item.excitement_level >= 2;
    if (filter === "alignment-high") return item.alignment_level >= 2;
    if (filter === "unrated") return !item.excitement_level && !item.alignment_level;
    return true;
  });

  const handleViewItem = (item: any) => {
    console.log('SimplifiedIdeasView: Opening item detail:', {
      itemId: item.id,
      itemTitle: item.title || 'No title',
      userId
    });
    setSelectedItem(item);
  };

  if (isLoading) {
    console.log('SimplifiedIdeasView: Showing loading state for userId:', userId);
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-classroom-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-classroom-text-secondary font-medium">Loading your ideas...</p>
        </div>
      </div>
    );
  }

  if (personalIdeas.length === 0) {
    console.log('SimplifiedIdeasView: No ideas found, showing empty state for userId:', userId);
    return <EmptyIdeasState />;
  }

  console.log('SimplifiedIdeasView: Rendering ideas grid with', filteredItems.length, 'items for userId:', userId);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-gradient-to-r from-classroom-surface via-classroom-cream to-classroom-surface rounded-xl p-6 border border-classroom-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-classroom-text-primary mb-2">Your Ideas</h3>
            <p className="text-body-md text-classroom-text-secondary font-medium">
              {personalIdeas.length} personal ideas saved
            </p>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-classroom-orange/20 text-classroom-orange border-classroom-orange/30 font-medium">
              <User className="h-3 w-3 mr-1.5" />
              {personalIdeas.length} ideas
            </Badge>
          </div>
        </div>
      </div>

      {/* Filter */}
      <IdeasFilter 
        filter={filter} 
        onFilterChange={setFilter}
        showDiscussionFilters={false}
        showSourceFilters={false}
      />

      {/* Ideas Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-classroom-text-secondary">No ideas match the current filter.</p>
          <p className="text-xs text-gray-400 mt-2">Try changing the filter or check if you have saved ideas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <IdeaItem
              key={item.id}
              item={item}
              onView={handleViewItem}
              onExcitementChange={handleExcitementRating}
              onAlignmentChange={handleAlignmentRating}
              comments={[]}
              recentComment={null}
              hasActiveDiscussion={false}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <IdeaDetailDialog
          selectedItem={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default SimplifiedIdeasView;
