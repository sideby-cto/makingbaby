
import { supabase } from "@/integrations/supabase/client";

export class EmailAuthService {
  /**
   * Check if current user is admin using the updated validation function
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      // Use the updated is_admin_user function that now uses profiles table
      const { data, error } = await supabase.rpc('is_admin_user');
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return Boolean(data);
    } catch (error) {
      console.error('Unexpected error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get current user ID safely
   */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      return user?.id || null;
    } catch (error) {
      console.error('Unexpected error getting current user:', error);
      return null;
    }
  }

  /**
   * Debug admin access - useful for troubleshooting
   */
  async debugAdminAccess(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('debug_admin_check');
      
      if (error) {
        console.error('Error in debug admin check:', error);
        return { error: error.message };
      }
      
      console.log('Admin debug info:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error in debug admin check:', error);
      return { error: error.message };
    }
  }

  /**
   * Log security-related operation for audit trail
   */
  async logSecurityOperation(operation: string, tableName: string, recordId?: string, metadata?: Record<string, any>) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      // The audit logging is now handled by database triggers, 
      // but we can add additional client-side logging if needed
      console.log(`Security operation logged: ${operation} on ${tableName}`, {
        userId,
        recordId,
        metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging security operation:', error);
    }
  }
}

export const emailAuthService = new EmailAuthService();
