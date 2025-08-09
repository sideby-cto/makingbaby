import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, User, RotateCcw, AlertCircle } from "lucide-react";
import { CompassQuartileProgress } from "@/types/database";
import { useCompassDescriptors } from "@/hooks/useCompassDescriptors";

interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface UserCompassData {
  profile: UserProfile;
  progress: CompassQuartileProgress | null;
}

interface ToggleOperation {
  userId: string;
  quartileNumber: number;
  isRetry?: boolean;
}

export const AdminLearningManagement: React.FC = () => {
  const [users, setUsers] = useState<UserCompassData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const [pendingOperations, setPendingOperations] = useState<Map<string, ToggleOperation>>(new Map());
  const [failedOperations, setFailedOperations] = useState<Map<string, ToggleOperation>>(new Map());
  const { toast } = useToast();
  const { descriptors } = useCompassDescriptors();

  const fetchUsers = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      console.log('AdminLearningManagement: Fetching user data...');
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('first_name', { ascending: true });

      if (profilesError) {
        console.error('AdminLearningManagement: Profile fetch error:', profilesError);
        throw profilesError;
      }

      // Fetch compass progress for all users
      const { data: progressData, error: progressError } = await supabase
        .from('compass_quartile_progress')
        .select('*');

      if (progressError) {
        console.error('AdminLearningManagement: Progress fetch error:', progressError);
        throw progressError;
      }

      // Combine profile and progress data
      const userData: UserCompassData[] = profiles.map(profile => {
        const progress = progressData.find(p => p.user_id === profile.id) || null;
        return { 
          profile: profile as UserProfile, 
          progress: progress as CompassQuartileProgress | null 
        };
      });

      console.log(`AdminLearningManagement: Successfully loaded ${userData.length} users`);
      setUsers(userData);
    } catch (error) {
      console.error('AdminLearningManagement: Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [toast]);

  // Fetch single user's progress data
  const fetchUserProgress = useCallback(async (userId: string): Promise<CompassQuartileProgress | null> => {
    try {
      const { data, error } = await supabase
        .from('compass_quartile_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('AdminLearningManagement: Error fetching user progress:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('AdminLearningManagement: Failed to fetch user progress:', error);
      return null;
    }
  }, []);

  // Update single user's progress in local state
  const updateUserProgress = useCallback((userId: string, newProgress: CompassQuartileProgress | null) => {
    setUsers(prevUsers => prevUsers.map(userData => 
      userData.profile.id === userId 
        ? { ...userData, progress: newProgress }
        : userData
    ));
  }, []);

  // Optimistically update UI before API call
  const applyOptimisticUpdate = useCallback((userId: string, quartileNumber: number, newValue: boolean) => {
    console.log(`AdminLearningManagement: Applying optimistic update for user ${userId}, quartile ${quartileNumber}, value ${newValue}`);
    
    setUsers(prevUsers => prevUsers.map(userData => {
      if (userData.profile.id !== userId) return userData;
      
      if (!userData.progress) {
        // Create new progress object if none exists
        const newProgress: CompassQuartileProgress = {
          id: '',
          user_id: userId,
          quartile_1: quartileNumber === 1 ? newValue : false,
          quartile_2: quartileNumber === 2 ? newValue : false,
          quartile_3: quartileNumber === 3 ? newValue : false,
          quartile_4: quartileNumber === 4 ? newValue : false,
          learn_completed: quartileNumber === 1 ? newValue : false,
          talk_completed: quartileNumber === 2 ? newValue : false,
          grow_completed: quartileNumber === 3 ? newValue : false,
          match_completed: quartileNumber === 4 ? newValue : false,
          progress_percentage: newValue ? 25 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null
        };
        return { ...userData, progress: newProgress };
      }
      
      // Update existing progress
      const updatedProgress = { ...userData.progress };
      const quartileKey = `quartile_${quartileNumber}` as keyof CompassQuartileProgress;
      (updatedProgress as any)[quartileKey] = newValue;
      
      // Update corresponding area completion flags
      if (quartileNumber === 1) updatedProgress.learn_completed = newValue;
      if (quartileNumber === 2) updatedProgress.talk_completed = newValue;
      if (quartileNumber === 3) updatedProgress.grow_completed = newValue;
      if (quartileNumber === 4) updatedProgress.match_completed = newValue;
      
      // Recalculate progress percentage
      const completedCount = [
        updatedProgress.quartile_1,
        updatedProgress.quartile_2,
        updatedProgress.quartile_3,
        updatedProgress.quartile_4
      ].filter(Boolean).length;
      updatedProgress.progress_percentage = completedCount * 25;
      
      return { ...userData, progress: updatedProgress };
    }));
  }, []);

  // Revert optimistic update on failure
  const revertOptimisticUpdate = useCallback(async (userId: string) => {
    console.log(`AdminLearningManagement: Reverting optimistic update for user ${userId}`);
    const actualProgress = await fetchUserProgress(userId);
    updateUserProgress(userId, actualProgress);
  }, [fetchUserProgress, updateUserProgress]);

  // Map quartile numbers to phase names
  const getPhaseInfo = useCallback((quartileNumber: number) => {
    const phaseMap = {
      1: 'learn',
      2: 'talk', 
      3: 'grow',
      4: 'match'
    };
    
    const stage = phaseMap[quartileNumber as keyof typeof phaseMap];
    const descriptor = descriptors?.find(d => d.stage === stage);
    
    return {
      name: descriptor?.display_name || `Quartile ${quartileNumber}`,
      description: descriptor?.description || `Phase ${quartileNumber} description`
    };
  }, [descriptors]);

  const toggleQuartile = useCallback(async (
    userId: string, 
    quartileNumber: number, 
    currentValue: boolean, 
    isRetry = false
  ) => {
    const operationKey = `${userId}-${quartileNumber}`;
    const newValue = !currentValue;
    
    // Prevent simultaneous operations on the same quartile
    if (updatingUsers.has(userId) && !isRetry) {
      console.warn(`AdminLearningManagement: Update already in progress for user ${userId}`);
      toast({
        title: "Update in progress",
        description: "Please wait for the current update to complete",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`AdminLearningManagement: Toggling quartile ${quartileNumber} for user ${userId} to ${newValue} (retry: ${isRetry})`);
      
      setUpdatingUsers(prev => new Set(prev).add(userId));
      setPendingOperations(prev => new Map(prev).set(operationKey, { userId, quartileNumber, isRetry }));
      
      // Apply optimistic update
      if (!isRetry) {
        applyOptimisticUpdate(userId, quartileNumber, newValue);
      }
      
      const { error } = await supabase.rpc('admin_toggle_compass_quartile', {
        target_user_id: userId,
        quartile_number: quartileNumber,
        new_value: newValue
      });

      if (error) {
        console.error('AdminLearningManagement: RPC error:', error);
        throw error;
      }

      console.log(`AdminLearningManagement: Successfully updated quartile ${quartileNumber} for user ${userId}`);
      
      // Success: The optimistic update should already be correct, no need to refetch
      // Since we fixed the RPC function to update both quartile and area fields properly
      
      toast({
        title: "Success",
        description: `${getPhaseInfo(quartileNumber).name} ${newValue ? 'enabled' : 'disabled'} successfully`,
      });
      
      // Clear any failed operations for this quartile
      setFailedOperations(prev => {
        const newMap = new Map(prev);
        newMap.delete(operationKey);
        return newMap;
      });
      
    } catch (error) {
      console.error(`AdminLearningManagement: Error toggling quartile for user ${userId}:`, error);
      
      // Revert optimistic update
      if (!isRetry) {
        await revertOptimisticUpdate(userId);
      }
      
      // Store failed operation for retry
      setFailedOperations(prev => new Map(prev).set(operationKey, { userId, quartileNumber, isRetry }));
      
      let errorMessage = "Failed to update quartile";
      if (error instanceof Error) {
        errorMessage = error.message.includes('Access denied') 
          ? "Access denied. Admin privileges required." 
          : `Failed to update: ${error.message}`;
      }
      
      const handleRetry = () => {
        setFailedOperations(prev => {
          const newMap = new Map(prev);
          newMap.delete(operationKey);
          return newMap;
        });
        toggleQuartile(userId, quartileNumber, currentValue, true);
      };
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        action: isRetry ? undefined : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        )
      });
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setPendingOperations(prev => {
        const newMap = new Map(prev);
        newMap.delete(operationKey);
        return newMap;
      });
    }
  }, [updatingUsers, applyOptimisticUpdate, fetchUserProgress, updateUserProgress, revertOptimisticUpdate, toast, getPhaseInfo]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(userData => {
    const fullName = `${userData.profile.first_name || ''} ${userData.profile.last_name || ''}`.toLowerCase();
    const email = userData.profile.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  const QuartileToggle: React.FC<{
    quartileNumber: number;
    userId: string;
    currentValue: boolean;
    disabled: boolean;
  }> = ({ quartileNumber, userId, currentValue, disabled }) => {
    const phaseInfo = getPhaseInfo(quartileNumber);
    
    return (
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Label htmlFor={`quartile-${quartileNumber}-${userId}`} className="text-sm cursor-help">
                {phaseInfo.name}
              </Label>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{phaseInfo.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Switch
          id={`quartile-${quartileNumber}-${userId}`}
          checked={currentValue}
          disabled={disabled}
          onCheckedChange={() => toggleQuartile(userId, quartileNumber, currentValue)}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Management</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-semantic-surface-secondary rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Learning Management
        </CardTitle>
        <CardDescription>
          Manage compass quartiles for users. Toggle individual quartiles to help users progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-semantic-text-tertiary w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* User List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredUsers.map(({ profile, progress }) => (
            <Card key={profile.id} className="border-semantic-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-semantic-text-primary">
                      {profile.first_name} {profile.last_name}
                    </h4>
                    <p className="text-sm text-semantic-text-secondary">
                      {profile.email}
                    </p>
                    <p className="text-xs text-semantic-text-tertiary mt-1">
                      Progress: {progress?.progress_percentage || 0}% complete
                    </p>
                  </div>
                  
                  {progress?.completed_at && (
                    <div className="text-xs text-semantic-primary">
                      Completed: {new Date(progress.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <QuartileToggle
                    quartileNumber={1}
                    userId={profile.id}
                    currentValue={progress?.quartile_1 || false}
                    disabled={updatingUsers.has(profile.id)}
                  />
                  <QuartileToggle
                    quartileNumber={2}
                    userId={profile.id}
                    currentValue={progress?.quartile_2 || false}
                    disabled={updatingUsers.has(profile.id)}
                  />
                  <QuartileToggle
                    quartileNumber={3}
                    userId={profile.id}
                    currentValue={progress?.quartile_3 || false}
                    disabled={updatingUsers.has(profile.id)}
                  />
                  <QuartileToggle
                    quartileNumber={4}
                    userId={profile.id}
                    currentValue={progress?.quartile_4 || false}
                    disabled={updatingUsers.has(profile.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-semantic-text-secondary">
              No users found matching your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};