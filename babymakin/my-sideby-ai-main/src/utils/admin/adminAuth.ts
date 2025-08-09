
import { supabase } from "@/integrations/supabase/client";

export interface AdminStatus {
  isAdmin: boolean;
  error?: string;
  debugInfo?: any;
}

export const checkAdminStatus = async (): Promise<AdminStatus> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { isAdmin: false, error: "No authenticated user" };
    }
    
    // Check by email domain (primary method)
    const isAdminByEmail = user.email?.endsWith('@sideby.ai') || false;
    console.log("Admin check by email:", isAdminByEmail, "for", user.email);
    
    if (isAdminByEmail) {
      return { isAdmin: true };
    }
    
    // Try database function as backup
    try {
      const { data: dbResult, error: dbError } = await supabase.rpc('debug_admin_check');
      
      if (dbError) {
        console.error("Database admin check failed:", dbError);
        return { 
          isAdmin: isAdminByEmail, 
          error: `Database check failed: ${dbError.message}`,
          debugInfo: { user: user.email, dbError } 
        };
      }
      
      return { 
        isAdmin: (dbResult as any)?.is_admin || isAdminByEmail,
        debugInfo: dbResult 
      };
    } catch (dbError) {
      console.error("RPC call failed:", dbError);
      return { 
        isAdmin: isAdminByEmail, 
        error: "RPC call failed",
        debugInfo: { user: user.email, dbError } 
      };
    }
    
  } catch (error) {
    console.error("Admin status check failed:", error);
    return { 
      isAdmin: false, 
      error: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const getAllMembers = async (): Promise<{ data: any[] | null; error: any }> => {
  // Check admin status first
  const adminStatus = await checkAdminStatus();
  
  if (!adminStatus.isAdmin) {
    return { 
      data: null, 
      error: new Error("Access denied: Admin privileges required") 
    };
  }
  
  // Try to get all members
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, status')
      .eq('status', 'active')
      .order('first_name', { ascending: true });
    
    if (error) {
      console.error("Failed to fetch members:", error);
      return { data: null, error };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} members`);
    return { data, error: null };
    
  } catch (error) {
    console.error("Error in getAllMembers:", error);
    return { data: null, error };
  }
};
