
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useReferenceData() {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users and communities for reference data
  const fetchData = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching reference data...");
      
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .is('status', null);  // Only active users
      
      if (userError) {
        console.error("Error fetching users:", userError);
        setError(`Error fetching users: ${userError.message}`);
        return false;
      }
      
      // Format user data
      const formattedUsers = userData.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim() || 'Unknown User'
      }));
      
      // Fetch communities
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('id, name');
      
      if (communityError) {
        console.error("Error fetching communities:", communityError);
        setError(`Error fetching communities: ${communityError.message}`);
        return false;
      }
      
      // Format community data
      const formattedCommunities = communityData.map(community => ({
        id: community.id,
        name: community.name || 'Unknown Community'
      }));
      
      // Update state with fetched data
      setUsers(formattedUsers);
      setCommunities(formattedCommunities);
      console.log("Reference data loaded successfully", {
        users: formattedUsers.length,
        communities: formattedCommunities.length
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected error fetching reference data:", error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, communities, isLoading, error, fetchData };
}
