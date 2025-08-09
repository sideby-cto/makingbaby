
// Add this new function to check if a user is an admin
export const isUserAdmin = (email?: string): boolean => {
  if (!email) return false;
  
  // Handle emails with + in them by extracting the base part
  const normalizedEmail = email.includes('+') 
    ? email.split('@')[0].split('+')[0] + '@' + email.split('@')[1]
    : email;
  
  // Check for sideby.ai email domain which indicates admin privileges
  const isAdmin = normalizedEmail.endsWith('@sideby.ai');
  console.log(`Admin check for ${email}: ${isAdmin ? 'Is admin' : 'Not admin'}`);
  return isAdmin;
};

// Export the function to be used in other components
export const checkAdminAccess = async (userId: string): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // First try to get user email from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return false;
    }
    
    // Check if email matches admin domain
    return isUserAdmin(profile?.email);
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};
