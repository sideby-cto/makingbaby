
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { findUserByEmail, verifyAdminPrivileges } from "./profileOperations";
import { executeUserDataDeletion } from "./resetProcess";

// Define a union type for all possible return values
export type ResetUserResult = 
  | { success: true; logs: string[] }
  | { success: true; logs: string[]; alreadyDeleted: true }
  | { partialSuccess: true; logs: string[]; message: string }
  | { success: false; error: string; logs: string[] };

export const resetUserData = async (email: string): Promise<ResetUserResult> => {
  try {
    console.log(`Starting reset process for ${email}`);
    
    // Get current admin user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to perform this action');
    
    // Verify admin privileges
    const isAdmin = await verifyAdminPrivileges(user.id);
    if (!isAdmin) {
      throw new Error('Only SideBy administrators can reset user data');
    }
    
    // First check if user exists
    const { userExists, userCheckError } = await findUserByEmail(email);
      
    if (userCheckError) {
      console.error('Error checking if user exists:', userCheckError);
    }
    
    if (!userExists) {
      console.log(`User with email ${email} not found in profiles table, they may have already been deleted`);
      return { 
        success: true,
        logs: [`User with email ${email} not found in profiles table, they may have already been deleted`],
        alreadyDeleted: true 
      };
    }
    
    console.log(`Found user with email ${email} and ID ${userExists.id}, proceeding with reset`);
    
    // Execute the deletion process
    return await executeUserDataDeletion(userExists);
    
  } catch (error) {
    console.error('Error resetting user:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to reset user data",
      variant: "destructive",
    });
    return { 
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      logs: [] 
    };
  }
};
