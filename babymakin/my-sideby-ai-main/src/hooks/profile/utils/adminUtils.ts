
import { supabase } from "@/integrations/supabase/client";

export interface AdminImpersonationData {
  isAdmin: boolean;
  targetUserId: string;
  viewingAsUserId: string | null;
}

export const checkAdminImpersonation = async (
  userId: string,
  userEmail: string | null
): Promise<AdminImpersonationData> => {
  let targetUserId = userId;
  let isAdmin = false;
  let viewingAsUserId: string | null = null;

  if (userEmail?.endsWith("@sideby.ai")) {
    isAdmin = true;
    console.log("User is admin, checking for impersonation");

    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("impersonating_user_id")
      .eq("id", userId)
      .single();

    if (adminError) {
      console.error("Error checking admin impersonation status:", adminError);
    } else {
      if (adminProfile?.impersonating_user_id) {
        console.log("Admin is impersonating user:", adminProfile.impersonating_user_id);
        targetUserId = adminProfile.impersonating_user_id;
        viewingAsUserId = adminProfile.impersonating_user_id;
      } else {
        console.log("Admin is not impersonating any user");
        viewingAsUserId = null;
      }
    }
  }

  return {
    isAdmin,
    targetUserId,
    viewingAsUserId,
  };
};
