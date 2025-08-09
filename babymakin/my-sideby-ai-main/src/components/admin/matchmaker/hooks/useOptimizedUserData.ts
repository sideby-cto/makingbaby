import { useState, useCallback, useEffect, useMemo } from "react";
import { Profile } from "../types/matchmaking";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toMatchmakingProfile } from "../utils/matchmakingProfileUtils";

interface OptimizedUserDataProps {
  selectedCommunity?: string;
  selectedCrew?: string | null;
  includeAdminUsers?: boolean;
  includeDeletedUsers?: boolean;
}

interface CachedData {
  profiles: Profile[];
  pacingData: any[];
  crewData: any[];
  matchCounts: Map<string, number>;
  adminUserIds: Set<string>;
  lastFetch: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let dataCache: CachedData | null = null;

export function useOptimizedUserData({ 
  selectedCommunity,
  selectedCrew,
  includeAdminUsers = true,
  includeDeletedUsers = false
}: OptimizedUserDataProps = {}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if we can use cached data
  const canUseCache = useMemo(() => {
    if (!dataCache) return false;
    
    const now = Date.now();
    const isStale = now - dataCache.lastFetch > CACHE_DURATION;
    
    return !isStale;
  }, []);

  const fetchAllData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use cache if available and not forcing refresh
      if (!forceRefresh && canUseCache && dataCache) {
        console.log("Using cached data");
        setProfiles(dataCache.profiles);
        setLoading(false);
        return;
      }

      console.log("Fetching fresh data");
      
      // Fetch base profiles
      let profilesQuery = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          has_completed_reflection,
          avatar_url,
          subject_statuses,
          bio,
          teaching_experience,
          metadata,
          primary_flow_activity,
          status,
          deleted_at
        `);
      
      if (!includeDeletedUsers) {
        profilesQuery = profilesQuery.eq('status', 'active');
      }
      
      // Execute all queries in parallel for better performance
      const [
        { data: profilesData, error: profilesError },
        { data: pacingData, error: pacingError },
        { data: crewData, error: crewError },
        { data: adminUsers, error: adminError }
      ] = await Promise.all([
        profilesQuery.order('status', { ascending: true }).order('first_name', { ascending: true }),
        supabase
          .from('user_pacing_preferences')
          .select('user_id, pacing_level, community_id')
          .eq('status', 'active'),
        supabase
          .from('crew_members')
          .select('user_id, crew_id, crews(id, name)')
          .eq('status', 'active'),
        supabase
          .from('admin_users')
          .select('id')
      ]);

      if (profilesError) throw profilesError;
      if (pacingError) console.warn("Error fetching pacing data:", pacingError);
      if (crewError) console.warn("Error fetching crew data:", crewError);
      if (adminError) console.warn("Error fetching admin users:", adminError);

      const rawProfiles = profilesData || [];
      
      // Fetch match counts in batches for better performance
      const userIds = rawProfiles.map(p => p.id);
      const batchSize = 50; // Process in smaller batches
      const matchCountsBatches = [];
      
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchPromises = batch.map(async (userId) => {
          try {
            const { data: matchCount } = await supabase
              .rpc('count_user_matches', { user_id: userId });
            return { userId, count: matchCount || 0 };
          } catch {
            return { userId, count: 0 };
          }
        });
        matchCountsBatches.push(Promise.all(batchPromises));
      }

      const allMatchCounts = await Promise.all(matchCountsBatches);
      const flatMatchCounts = allMatchCounts.flat();
      
      // Create optimized lookup maps
      const pacingMap = new Map();
      if (pacingData) {
        pacingData.forEach(item => {
          pacingMap.set(item.user_id, {
            level: item.pacing_level,
            community_id: item.community_id
          });
        });
      }
      
      const crewMap = new Map();
      if (crewData) {
        crewData.forEach(item => {
          const crews = crewMap.get(item.user_id) || [];
          crews.push(item.crew_id);
          crewMap.set(item.user_id, crews);
        });
      }
      
      const adminUserIds = new Set<string>();
      if (adminUsers) {
        adminUsers.forEach(user => adminUserIds.add(user.id));
      }
      
      const matchCountMap = new Map();
      flatMatchCounts.forEach(({ userId, count }) => {
        matchCountMap.set(userId, count);
      });

      // Transform profiles
      const enrichedProfiles = rawProfiles.map(profile => {
        const transformedProfile = toMatchmakingProfile(profile);
        
        if (pacingMap.has(profile.id)) {
          const pacingInfo = pacingMap.get(profile.id);
          transformedProfile.pacing = {
            level: pacingInfo.level,
            community_id: pacingInfo.community_id,
            community_name: "Community"
          };
        }
        
        if (crewMap.has(profile.id)) {
          if (!transformedProfile.metadata) transformedProfile.metadata = {};
          transformedProfile.metadata.crews = crewMap.get(profile.id);
        }
        
        const isAdmin = adminUserIds.has(profile.id) || profile.email.endsWith('@sideby.ai');
        if (isAdmin) {
          if (!transformedProfile.metadata) transformedProfile.metadata = {};
          transformedProfile.metadata.is_admin = true;
        }
        
        transformedProfile.status = profile.status;
        transformedProfile.deleted_at = profile.deleted_at;
        transformedProfile.count_matches = matchCountMap.get(profile.id) || 0;
        
        return transformedProfile;
      });

      // Cache the data
      dataCache = {
        profiles: enrichedProfiles,
        pacingData: pacingData || [],
        crewData: crewData || [],
        matchCounts: matchCountMap,
        adminUserIds,
        lastFetch: Date.now()
      };
      
      setProfiles(enrichedProfiles);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      setError(error.message || "There was a problem loading the user data.");
      toast({
        title: "Error fetching profiles",
        description: "There was a problem loading the user data.",
        variant: "destructive",
      });
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [includeAdminUsers, includeDeletedUsers, canUseCache, toast]);

  // Filter profiles based on community and crew
  const filteredProfiles = useMemo(() => {
    let filtered = profiles;

    // Apply community filter
    if (selectedCommunity && selectedCommunity !== "all") {
      filtered = filtered.filter(profile => {
        return profile.pacing?.community_id === selectedCommunity;
      });
    }

    // Apply crew filter
    if (selectedCrew) {
      filtered = filtered.filter(profile => {
        return profile.metadata?.crews?.includes(selectedCrew);
      });
    }

    return filtered;
  }, [profiles, selectedCommunity, selectedCrew]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAllData(true);
    setIsRefreshing(false);
  }, [fetchAllData]);

  return {
    profiles: filteredProfiles,
    loading,
    isRefreshing,
    handleRefresh,
    error
  };
}