
import { supabase } from "@/integrations/supabase/client";

// Find user by email
export async function findUserByEmail(email: string) {
  const { data: userExists, error: userCheckError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();
    
  if (userCheckError) {
    console.error('Error checking if user exists:', userCheckError);
  }
  
  return { userExists, userCheckError };
}

// Delete profile
export async function deleteProfile(userId: string) {
  return await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
}

// Handle posts with user references
export async function handleUserPosts(userId: string) {
  // Check if posts still have references to this user
  const { data: remainingPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId);
    
  if (remainingPosts && remainingPosts.length > 0) {
    // Try nullifying user_id in posts table as last resort
    return await supabase
      .from('posts')
      .update({ 
        status: 'deleted',
        user_id: null  // Break the foreign key constraint
      })
      .eq('user_id', userId);
  }
  
  return { data: null, error: null };
}

// Call database function to handle user posts deletion
export async function callUserPostsDeletionFunction(userId: string) {
  return await supabase.rpc(
    'handle_user_posts_deletion',
    { user_id_param: userId }
  );
}

// Verify if user has admin privileges
export async function verifyAdminPrivileges(userId: string) {
  const { data: adminCheck } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();
    
  return adminCheck?.email?.endsWith('@sideby.ai') || false;
}

// Get user initials from first and last name with better fallback logic
export function getInitials(firstName?: string, lastName?: string): string {
  // Log input for debugging
  console.log("getInitials input:", { firstName, lastName });
  
  // Safely handle empty or undefined values
  if (!firstName && !lastName) {
    return "U";
  }
  
  const first = firstName && firstName.trim() ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName && lastName.trim() ? lastName.charAt(0).toUpperCase() : '';
  
  // If we have at least one initial, return it/them
  if (first || last) {
    return `${first}${last}`;
  }
  
  return 'U'; // Return 'U' if somehow the result is empty
}
