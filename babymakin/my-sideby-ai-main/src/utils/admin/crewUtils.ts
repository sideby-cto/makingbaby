
import { supabase } from "@/integrations/supabase/client";

export const isCrewLead = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('crew_members')
      .select('is_lead')
      .eq('user_id', userId)
      .eq('is_lead', true)
      .single();
      
    if (error) {
      console.error("Error checking crew lead status:", error);
      return false;
    }
    
    return !!data?.is_lead;
  } catch (error) {
    console.error("Error checking crew lead status:", error);
    return false;
  }
};

export const getCrewLeadInfo = async (crewId: string) => {
  try {
    const { data, error } = await supabase
      .from('crew_members')
      .select(`
        profiles!inner(
          first_name,
          last_name,
          email
        )
      `)
      .eq('crew_id', crewId)
      .eq('is_lead', true)
      .single();

    if (error || !data) {
      return null;
    }

    // Handle the case where profiles might be an array or object
    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    
    return {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email
    };
  } catch (error) {
    console.error("Error fetching crew lead:", error);
    return null;
  }
};
