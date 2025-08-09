
import { supabase } from "@/integrations/supabase/client";
import { EmailAccount } from "../centralizedEmailService";
import { emailAuthService } from "./EmailAuthService";

export class EmailAccountService {
  /**
   * Get all email accounts with enhanced security
   */
  async getEmailAccounts(): Promise<EmailAccount[]> {
    try {
      // Check admin access first using the new validation function
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to view email accounts');
      }

      // RLS policies will now automatically enforce access control
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .order('account_type');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error loading email accounts:', error);
      throw error;
    }
  }

  /**
   * Create or update email account with enhanced security
   */
  async saveEmailAccount(account: Partial<EmailAccount>): Promise<EmailAccount> {
    try {
      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to save email accounts');
      }

      // Log the operation for audit trail
      await emailAuthService.logSecurityOperation(
        account.id ? 'UPDATE' : 'CREATE',
        'email_accounts',
        account.id,
        { accountType: account.account_type, fromEmail: account.from_email }
      );

      if (account.id) {
        // Update existing account
        const { data, error } = await supabase
          .from('email_accounts')
          .update({
            from_email: account.from_email,
            from_name: account.from_name,
            account_type: account.account_type,
            is_default: account.is_default,
            updated_at: new Date().toISOString()
          })
          .eq('id', account.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      } else {
        // Create new account
        const { data, error } = await supabase
          .from('email_accounts')
          .insert({
            from_email: account.from_email,
            from_name: account.from_name,
            account_type: account.account_type,
            is_default: account.is_default || false
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      }
    } catch (error: any) {
      console.error('Error saving email account:', error);
      throw error;
    }
  }

  /**
   * Delete email account with enhanced security
   */
  async deleteEmailAccount(accountId: string): Promise<void> {
    try {
      // Check admin access first
      const isAdmin = await emailAuthService.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error('Admin access required to delete email accounts');
      }

      // Log the operation for audit trail
      await emailAuthService.logSecurityOperation('DELETE', 'email_accounts', accountId);

      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting email account:', error);
      throw error;
    }
  }
}

export const emailAccountService = new EmailAccountService();
