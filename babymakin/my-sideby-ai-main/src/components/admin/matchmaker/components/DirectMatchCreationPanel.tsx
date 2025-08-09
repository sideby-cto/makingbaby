import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserPlus, X, Shuffle, Heart, Sparkles } from 'lucide-react';
import { Profile } from '../types/matchmaking';
import { useCreateMatch } from '../matches/hooks/useCreateMatch';
import { useToast } from '@/hooks/use-toast';

interface DirectMatchCreationPanelProps {
  isOpen: boolean;
  selectedUsers: Profile[];
  onRemoveUser: (userId: string) => void;
  onClearUsers: () => void;
  onMatchCreated?: () => void;
  onAddUser?: (user: Profile) => void;
}

export const DirectMatchCreationPanel: React.FC<DirectMatchCreationPanelProps> = ({
  isOpen,
  selectedUsers,
  onRemoveUser,
  onClearUsers,
  onMatchCreated,
  onAddUser
}) => {
  const [rationale, setRationale] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { createMatch, isLoading } = useCreateMatch();
  const { toast } = useToast();

  const canCreateMatch = selectedUsers.length === 2;
  const user1 = selectedUsers[0];
  const user2 = selectedUsers[1];

  const handleCreateMatch = useCallback(async () => {
    if (!canCreateMatch || !user1 || !user2) return;

    try {
      await createMatch({
        user1_id: user1.id,
        user2_id: user2.id,
        rationale: rationale || `Match created for ${user1.first_name} ${user1.last_name} and ${user2.first_name} ${user2.last_name}`,
        status: 'active'
      });

      toast({
        title: "Match Created",
        description: `Successfully matched ${user1.first_name} with ${user2.first_name}`,
      });

      // Reset form
      setRationale('');
      onClearUsers();
      onMatchCreated?.();
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match. Please try again.",
        variant: "destructive",
      });
    }
  }, [canCreateMatch, user1, user2, rationale, createMatch, toast, onClearUsers, onMatchCreated]);

  const handleDrop = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!onAddUser || selectedUsers.length >= 2) return;
    
    try {
      const profileData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (!profileData) return;
      
      const profile: Profile = JSON.parse(profileData);
      
      // Check if user is already selected
      if (selectedUsers.some(user => user.id === profile.id)) {
        toast({
          title: "User Already Selected",
          description: "This user is already selected for matching.",
          variant: "destructive",
        });
        return;
      }
      
      onAddUser(profile);
    } catch (error) {
      console.error('Error handling drop:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  }, [onAddUser, selectedUsers, toast]);

  const handleDragOver = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverIndex(slotIndex);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  if (!isOpen) return null;

  return (
    <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" />
          Direct Match Creation
          {canCreateMatch && (
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Ready to Match
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Selected Users Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Selected Users ({selectedUsers.length}/2)
            </span>
            {selectedUsers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearUsers}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {selectedUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                    {user.first_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveUser(user.id)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 2 - selectedUsers.length }, (_, index) => {
              const slotIndex = selectedUsers.length + index;
              const isHighlighted = dragOverIndex === slotIndex;
              
              return (
                <div
                  key={`empty-${index}`}
                  className={`flex items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors ${
                    isHighlighted 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted bg-muted/20'
                  }`}
                  onDrop={(e) => handleDrop(e, slotIndex)}
                  onDragOver={(e) => handleDragOver(e, slotIndex)}
                  onDragLeave={handleDragLeave}
                >
                  <div className="text-center text-muted-foreground">
                    <UserPlus className={`h-6 w-6 mx-auto mb-2 opacity-50 ${isHighlighted ? 'text-primary' : ''}`} />
                    <div className={`text-sm ${isHighlighted ? 'text-primary' : ''}`}>
                      Drop user {selectedUsers.length + index + 1} here
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Rationale */}
        {canCreateMatch && (
          <>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Match Rationale (Optional)
              </label>
              <Textarea
                placeholder="Why are these users a good match? (This will be visible to both users)"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleCreateMatch}
            disabled={!canCreateMatch || isLoading}
            className="flex-1"
            size="sm"
          >
            {isLoading ? (
              <>
                <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                Creating Match...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Create Match
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        {selectedUsers.length === 0 && (
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">
              Select exactly 2 users from the grid above to create a match
            </div>
          </div>
        )}
        
        {selectedUsers.length === 1 && (
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <div className="text-sm text-primary">
              Select 1 more user to create a match
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};