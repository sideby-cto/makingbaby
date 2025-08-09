
import React, { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { IdeasFilter } from "./IdeasFilter";
import { IdeasList } from "./IdeasList";
import { IdeaDetailDialog } from "./IdeaDetailDialog";
import { EmptyIdeasState } from "./EmptyIdeasState";
import { useSavedIdeasQuery } from "./hooks/useSavedIdeasQuery";
import { useOptimisticSavedIdeas } from "./hooks/useOptimisticSavedIdeas";
import { SavedItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface IdeasViewProps {
  userId: string;
}

const IdeasView = ({ userId }: IdeasViewProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  
  console.log('IdeasView: Rendering with userId:', userId);
  
  // Use React Query to fetch saved ideas
  const { data: savedItems = [], isLoading, error } = useSavedIdeasQuery(userId);
  
  // Use optimistic updates for rating changes
  const { updateRating, isUpdating } = useOptimisticSavedIdeas(userId);

  // Derive selectedItem from current data
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return savedItems.find(item => item.id === selectedItemId) || null;
  }, [selectedItemId, savedItems]);

  // Show error state if query failed
  if (error) {
    console.error('IdeasView: Error loading saved ideas:', error);
    toast({
      title: "Error",
      description: "Failed to load saved ideas",
      variant: "destructive",
    });
  }

  // Wrapper functions to handle the click event and call the rating handlers
  const handleExcitementRating = async (e: React.MouseEvent, level: number, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('IdeasView: Handling excitement rating:', level, 'for item:', itemId);
    updateRating({ itemId, field: 'excitement_level', value: level });
  };

  const handleAlignmentRating = async (e: React.MouseEvent, level: number, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('IdeasView: Handling alignment rating:', level, 'for item:', itemId);
    updateRating({ itemId, field: 'alignment_level', value: level });
  };

  // Dialog handlers without event parameter
  const handleDialogExcitementChange = async (level: number, itemId: string) => {
    console.log('IdeasView: Handling dialog excitement rating:', level, 'for item:', itemId);
    updateRating({ itemId, field: 'excitement_level', value: level });
  };

  const handleDialogAlignmentChange = async (level: number, itemId: string) => {
    console.log('IdeasView: Handling dialog alignment rating:', level, 'for item:', itemId);
    updateRating({ itemId, field: 'alignment_level', value: level });
  };

  const filteredItems = savedItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "excitement-high") return item.excitement_level >= 2;
    if (filter === "alignment-high") return item.alignment_level >= 2;
    if (filter === "unrated") return !item.excitement_level && !item.alignment_level;
    return true;
  });

  const handleViewItem = (item: SavedItem) => {
    setSelectedItemId(item.id);
  };

  const handleDialogClose = () => {
    setSelectedItemId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-classroom-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-classroom-text-secondary">Loading your ideas...</p>
        </div>
      </div>
    );
  }

  if (savedItems.length === 0) {
    return <EmptyIdeasState />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-gradient-to-r from-classroom-surface to-classroom-cream rounded-lg p-4 border border-classroom-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-classroom-text-primary mb-1">Your Ideas Collection</h3>
            <p className="text-sm text-classroom-text-secondary">
              {savedItems.length} ideas saved and ready for exploration
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="secondary" className="bg-classroom-orange/20 text-classroom-orange">
              <User className="h-3 w-3 mr-1" />
              {savedItems.length} ideas
            </Badge>
          </div>
        </div>
      </div>

      {/* Filter */}
      <IdeasFilter 
        filter={filter} 
        onFilterChange={setFilter}
        showDiscussionFilters={false}
      />

      {/* Ideas List */}
      <IdeasList
        items={filteredItems}
        onViewItem={handleViewItem}
        onExcitementChange={handleExcitementRating}
        onAlignmentChange={handleAlignmentRating}
        comments={{}}
        hasActiveDiscussion={() => false}
        getRecentComment={() => null}
        isUpdating={isUpdating}
      />

      {/* Detail Dialog */}
      {selectedItem && (
        <IdeaDetailDialog
          selectedItem={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && handleDialogClose()}
        />
      )}
    </div>
  );
};

export default IdeasView;
