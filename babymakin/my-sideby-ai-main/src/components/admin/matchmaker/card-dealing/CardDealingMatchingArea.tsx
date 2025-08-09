
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Users, Shuffle, AlertTriangle } from 'lucide-react';
import { Profile } from '../types/matchmaking';
import { PreMatchTouchpointAnalysis } from './PreMatchTouchpointAnalysis';
import { getDisplayName } from '../utils/matchmakingProfileUtils';
import { useMatchCreation } from '../hooks/useMatchCreation';
import { MatchConfirmationDialog } from '../components/MatchConfirmationDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CardDealingMatchingAreaProps {
  onMatchCreated?: () => void;
}

export const CardDealingMatchingArea: React.FC<CardDealingMatchingAreaProps> = ({
  onMatchCreated
}) => {
  const [droppedUsers, setDroppedUsers] = useState<(Profile | null)[]>([null, null]);
  const [matchDescription, setMatchDescription] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const { isCreating, createMatch } = useMatchCreation();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setDragError(null);
    
    console.log('Drop event triggered');
    console.log('DataTransfer types:', Array.from(e.dataTransfer.types));
    
    try {
      let profileData;
      let dataFound = false;
      
      // Try different data formats in order of preference
      if (e.dataTransfer.types.includes('profile')) {
        profileData = e.dataTransfer.getData('profile');
        dataFound = true;
        console.log('Found profile data type');
      } else if (e.dataTransfer.types.includes('application/json')) {
        profileData = e.dataTransfer.getData('application/json');
        dataFound = true;
        console.log('Found application/json data type');
      } else if (e.dataTransfer.types.includes('text/plain')) {
        profileData = e.dataTransfer.getData('text/plain');
        dataFound = true;
        console.log('Found text/plain data type');
      }
      
      if (!dataFound || !profileData) {
        const errorMsg = `No valid profile data found. Available types: ${Array.from(e.dataTransfer.types).join(', ')}`;
        console.error(errorMsg);
        setDragError(errorMsg);
        return;
      }
      
      console.log('Raw profile data:', profileData);
      
      let profile: Profile;
      try {
        profile = JSON.parse(profileData);
        console.log('Parsed profile:', profile);
      } catch (parseError) {
        const errorMsg = `Failed to parse profile data: ${parseError}`;
        console.error(errorMsg);
        setDragError(errorMsg);
        return;
      }
      
      // Validate profile structure
      if (!profile.id || !profile.email) {
        const errorMsg = 'Invalid profile: missing required fields (id, email)';
        console.error(errorMsg, profile);
        setDragError(errorMsg);
        return;
      }
      
      // Add the user to the first available slot
      setDroppedUsers(prev => {
        if (!prev[0]) {
          console.log('Adding user to slot 1');
          return [profile, prev[1]];
        } else if (!prev[1] && prev[0].id !== profile.id) {
          console.log('Adding user to slot 2');
          return [prev[0], profile];
        } else if (prev[0].id === profile.id || (prev[1] && prev[1].id === profile.id)) {
          console.log('User already added, ignoring duplicate');
          setDragError('This user is already in the matching area');
          return prev;
        } else {
          // Replace first slot if both are filled
          console.log('Replacing user in slot 1');
          return [profile, prev[1]];
        }
      });
      
      console.log('Successfully processed drop');
    } catch (error) {
      const errorMsg = `Error processing dropped user: ${error}`;
      console.error(errorMsg);
      setDragError(errorMsg);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    
    if (!isDragActive) {
      setIsDragActive(true);
      setDragError(null);
      console.log('Drag over activated');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set drag inactive if we're truly leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragActive(false);
      console.log('Drag leave deactivated');
    }
  };

  const handleRemoveUser = (index: number) => {
    console.log(`Removing user from slot ${index + 1}`);
    setDroppedUsers(prev => {
      const newUsers = [...prev];
      newUsers[index] = null;
      return newUsers;
    });
    setDragError(null);
  };

  const clearAllUsers = () => {
    console.log('Clearing all users');
    setDroppedUsers([null, null]);
    setMatchDescription('');
    setDragError(null);
  };

  const createMatchHandler = () => {
    if (droppedUsers[0] && droppedUsers[1]) {
      console.log('Opening match confirmation dialog');
      setShowConfirmDialog(true);
    }
  };

  const confirmMatch = async (rationale: string) => {
    if (droppedUsers[0] && droppedUsers[1]) {
      console.log('Creating match with users:', droppedUsers[0].id, droppedUsers[1].id);
      try {
        await createMatch({
          user1: droppedUsers[0],
          user2: droppedUsers[1],
          score: 100,
          matchType: 'exact',
          rationale: rationale || matchDescription
        });
        clearAllUsers();
        setShowConfirmDialog(false);
        onMatchCreated?.();
        console.log('Match created successfully');
      } catch (error) {
        console.error('Error creating match:', error);
        setDragError(`Failed to create match: ${error}`);
      }
    }
  };

  const getDisplayNameForUser = (user: Profile) => getDisplayName(user);
  
  const getInitials = (user: Profile) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 
           (user.email ? user.email[0].toUpperCase() : 'U');
  };

  const bothUsersSelected = droppedUsers[0] && droppedUsers[1];

  return (
    <>
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-green-900">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              2. Create Match
            </div>
            {(droppedUsers[0] || droppedUsers[1]) && (
              <Button
                onClick={clearAllUsers}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </CardTitle>
          <p className="text-sm text-green-700">
            Drag users from above to create a match
          </p>
        </CardHeader>
        <CardContent
          className="space-y-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Error Display */}
          {dragError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{dragError}</AlertDescription>
            </Alert>
          )}

          {/* Drop Zone */}
          <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
            isDragActive 
              ? 'border-green-400 bg-green-100' 
              : bothUsersSelected
                ? 'border-green-300 bg-white'
                : 'border-gray-300 bg-gray-50'
          }`}>
            {!droppedUsers[0] && !droppedUsers[1] ? (
              <div className="text-center py-8">
                <Shuffle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Drop users here to create a match</p>
                <p className="text-sm text-gray-500 mt-1">
                  You can drag users from the selection grid above
                </p>
                {isDragActive && (
                  <p className="text-sm text-green-600 mt-2 font-medium animate-pulse">
                    Release to drop user here
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {droppedUsers.map((user, index) => (
                  <div key={index} className="relative">
                    {user ? (
                      <div className="bg-white rounded-lg p-3 border shadow-sm">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || ''} alt={getDisplayNameForUser(user)} />
                            <AvatarFallback>{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{getDisplayNameForUser(user)}</h4>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          </div>
                          <Button
                            onClick={() => handleRemoveUser(index)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        isDragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="text-gray-500">
                          <Users className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm">User {index + 1}</p>
                          {isDragActive && (
                            <p className="text-xs text-green-600 mt-1 animate-pulse">Drop here</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Match Description */}
          {bothUsersSelected && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Description (Optional)
                </label>
                <Textarea
                  placeholder="Why is this a good match? Add any notes about this pairing..."
                  value={matchDescription}
                  onChange={(e) => setMatchDescription(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <Button
                onClick={createMatchHandler}
                disabled={isCreating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isCreating ? 'Creating Match...' : 'Create Match'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-Match Analysis */}
      {bothUsersSelected && (
        <PreMatchTouchpointAnalysis
          user1={droppedUsers[0]!}
          user2={droppedUsers[1]!}
        />
      )}

      {/* Match Confirmation Dialog */}
      {droppedUsers[0] && droppedUsers[1] && (
        <MatchConfirmationDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          user1={droppedUsers[0]}
          user2={droppedUsers[1]}
          onConfirm={confirmMatch}
          isCreating={isCreating}
          defaultRationale={matchDescription}
          matchType="manual"
        />
      )}
    </>
  );
};
