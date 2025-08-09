import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Lightbulb, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useAdminIdeasQuery } from "../hooks/useAdminIdeasQuery";
import { useAdminIdeaActions } from "../hooks/useAdminIdeaActions";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { formatDistanceToNow } from "date-fns";

export const AdminIdeasTab = () => {
  const { startMeasure, endMeasure } = usePerformanceMonitor('AdminIdeasTab');
  const [newIdeaContent, setNewIdeaContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  React.useEffect(() => {
    startMeasure('render');
    return () => endMeasure('render');
  }, [startMeasure, endMeasure]);

  const { data: ideasStats, isLoading, error } = useAdminIdeasQuery();
  const { 
    approveIdea, 
    rejectIdea, 
    createIdea, 
    isApproving, 
    isRejecting, 
    isCreating 
  } = useAdminIdeaActions();

  const handleCreateIdea = () => {
    if (newIdeaContent.trim()) {
      createIdea(newIdeaContent.trim());
      setNewIdeaContent("");
      setIsCreateDialogOpen(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-semantic-text-primary font-medium">Failed to load ideas</p>
          <p className="text-semantic-text-secondary text-sm mt-2">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-sm text-semantic-text-primary font-sans">
            Idea Management
          </h2>
          <p className="text-body-md text-semantic-text-secondary mt-2">
            Manage and review community ideas submitted by learners
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={18} weight="regular" />
              Add Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter the idea content..."
                value={newIdeaContent}
                onChange={(e) => setNewIdeaContent(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateIdea}
                  disabled={!newIdeaContent.trim() || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Idea"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-display-sm font-bold text-semantic-text-primary">
                {ideasStats?.total || 0}
              </div>
            )}
            <p className="text-body-xs text-semantic-text-secondary">
              Community submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Pending Review</CardTitle>
            <Lightbulb className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-display-sm font-bold text-semantic-text-primary">
                {ideasStats?.pending || 0}
              </div>
            )}
            <p className="text-body-xs text-semantic-text-secondary">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Approved Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-semantic-text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-display-sm font-bold text-semantic-text-primary">
                {ideasStats?.approved || 0}
              </div>
            )}
            <p className="text-body-xs text-semantic-text-secondary">
              Ready for implementation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ideas</CardTitle>
          <CardDescription>
            Latest ideas submitted by the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-semantic-border rounded-lg">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : ideasStats?.recent.length ? (
            <div className="space-y-4">
              {ideasStats.recent.map((idea) => (
                <div key={idea.id} className="flex items-center justify-between p-4 border border-semantic-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-body-md font-medium text-semantic-text-primary mb-1">
                      {idea.content.length > 100 
                        ? `${idea.content.substring(0, 100)}...` 
                        : idea.content
                      }
                    </h4>
                    <p className="text-body-sm text-semantic-text-secondary">
                      Submitted by {idea.user?.first_name || 'Unknown'} {idea.user?.last_name || ''} • {' '}
                      {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => rejectIdea(idea.id)}
                      disabled={isRejecting}
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => approveIdea(idea.id)}
                      disabled={isApproving}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-semantic-text-secondary">No ideas found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};