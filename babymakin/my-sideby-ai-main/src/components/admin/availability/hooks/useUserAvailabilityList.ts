
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserWithAvailability {
  id: string;
  email: string;
  fullName: string;
  hasAvailability: boolean;
  availabilitySlots?: { day: string, hour: number }[];
}

export const useUserAvailabilityList = () => {
  const [users, setUsers] = useState<UserWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    
    try {
      // Get all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('status', 'active')
        .order('first_name', { ascending: true });
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error",
          description: "Failed to load user profiles.",
          variant: "destructive",
        });
        return;
      }
      
      // Then get availability info - select most recent record per user
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('user_availability')
        .select('user_id, time_slots, created_at');
        
      if (availabilityError) {
        console.error("Error fetching availability data:", availabilityError);
        toast({
          title: "Error",
          description: "Failed to load availability data.",
          variant: "destructive",
        });
      }
      
      // Group availability by user_id and get the most recent one
      const latestAvailability = new Map();
      availabilityData?.forEach(item => {
        if (!item.user_id || !item.time_slots) return;
        
        if (!latestAvailability.has(item.user_id) || 
            new Date(item.created_at) > new Date(latestAvailability.get(item.user_id).created_at)) {
          latestAvailability.set(item.user_id, {
            time_slots: item.time_slots,
            created_at: item.created_at
          });
        }
      });
      
      // Format user data with availability info
      const formattedUsers = profilesData.map(profile => {
        const availability = latestAvailability.get(profile.id);
        const hasAvailability = availability && 
                               Array.isArray(availability.time_slots) &&
                               availability.time_slots.length > 0;
        
        return {
          id: profile.id,
          email: profile.email || '',
          fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
          hasAvailability
        };
      });
      
      setUsers(formattedUsers);
      
      // If no user is selected yet and we have users, select the first one
      if (!selectedUserId && formattedUsers.length > 0) {
        setSelectedUserId(formattedUsers[0].id);
      }
    } catch (err) {
      console.error("Error fetching users with availability:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, toast]);
  
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);
  
  return {
    users,
    loading,
    selectedUserId,
    setSelectedUserId,
    refreshUsers
  };
};
