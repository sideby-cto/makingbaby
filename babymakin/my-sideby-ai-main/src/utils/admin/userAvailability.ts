
import { supabase } from "@/integrations/supabase/client";

export interface AdminUserAvailability {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  pacing_level: string | null;
  time_slots: any; // Changed from any[] to any to match the database type
  created_at: string;
  updated_at: string;
}

export const fetchAdminUserAvailability = async (): Promise<AdminUserAvailability[]> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    // Check if user is admin using the updated validation
    if (!currentUser.user) {
      console.error("User not authenticated");
      return [];
    }

    // Use the updated admin validation function
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user');
    
    if (adminError || !isAdmin) {
      console.error("Unauthorized access to admin user availability:", adminError);
      return [];
    }
    
    // Use the updated admin_user_availability_view that now uses profiles table
    const { data, error } = await supabase
      .from('admin_user_availability_view')
      .select('*')
      .order('first_name');
    
    if (error) {
      console.error("Error fetching admin user availability:", error);
      return [];
    }
    
    // Transform the data to match our interface
    const transformedData = data?.map(item => ({
      id: item.id,
      user_id: item.user_id,
      first_name: item.first_name || null,
      last_name: item.last_name || null,
      email: item.email || null,
      pacing_level: item.pacing_level,
      time_slots: item.time_slots,
      created_at: item.created_at,
      updated_at: item.updated_at
    })) || [];
    
    return transformedData as AdminUserAvailability[];
  } catch (err) {
    console.error("Exception fetching admin user availability:", err);
    return [];
  }
};
