
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface HardDeleteResult {
  success: boolean;
  message?: string;
  deletions?: Record<string, number>;
  partialSuccess?: boolean;
  error?: string;
}

export interface SafetyReport {
  user_info: {
    name: string;
    email: string;
    created_at: string;
    status: string;
    is_admin: boolean;
  };
  data_impact: {
    matches: number;
    posts: number;
    comments: number;
  };
  warnings: string[];
}

interface SafetyCheckResponse {
  success: boolean;
  safety_report?: SafetyReport;
  error?: string;
}

interface HardDeleteResponse {
  success: boolean;
  message?: string;
  deletions?: Record<string, number>;
  partialSuccess?: boolean;
  error?: string;
}

export const checkUserDeletionSafety = async (userId: string): Promise<SafetyCheckResponse> => {
  try {
    console.log(`Checking deletion safety for user ${userId}`);
    
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    const { data, error } = await supabase.rpc('check_user_deletion_safety', {
      user_id_param: userId
    });

    if (error) {
      console.error('Supabase RPC error in checkUserDeletionSafety:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from safety check');
      throw new Error('No data returned from safety check');
    }

    console.log('Raw safety check data:', data);

    // Two-step type assertion to properly handle the Json response
    const response = data as unknown as SafetyCheckResponse;
    
    if (!response.success) {
      console.error('Safety check returned failure:', response.error);
      throw new Error(response.error || 'Safety check failed');
    }

    return response;
  } catch (error) {
    console.error('Error in checkUserDeletionSafety:', error);
    
    // Don't show toast here since we'll handle it in the component
    return { 
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during safety check"
    };
  }
};

export const hardDeleteUserAccount = async (userId: string, email: string): Promise<HardDeleteResult> => {
  try {
    console.log(`Starting hard delete process for user ${userId} (${email})`);
    
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email provided');
    }

    // Execute hard delete
    const { data, error } = await supabase.rpc('hard_delete_user_account', {
      user_id_param: userId
    });

    if (error) {
      console.error('Supabase RPC error in hardDeleteUserAccount:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from hard delete');
      throw new Error('No data returned from delete operation');
    }

    console.log('Raw hard delete data:', data);
    
    // Two-step type assertion to properly handle the Json response
    const response = data as unknown as HardDeleteResponse;
    
    if (!response.success && !response.partialSuccess) {
      console.error('Hard delete returned failure:', response.error);
      throw new Error(response.error || 'Delete operation failed');
    }

    console.log('Hard delete completed successfully:', {
      success: response.success,
      partialSuccess: response.partialSuccess,
      deletions: response.deletions
    });
    
    return {
      success: response.success,
      message: response.message,
      deletions: response.deletions,
      partialSuccess: response.partialSuccess
    };
    
  } catch (error) {
    console.error('Error in hardDeleteUserAccount:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during deletion"
    };
  }
};
