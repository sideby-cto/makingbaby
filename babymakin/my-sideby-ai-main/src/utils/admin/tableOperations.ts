
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";
import type { TableInfo, TableName } from "./types";

// Types for more clear return values
export type SupabaseResult = {
  success: boolean;
  error?: string;
  count?: number;
  data?: any;
}

/**
 * Delete user records from a specific table
 */
export const deleteUserFromTable = async (
  tableName: TableName | string,
  userIdColumn: string,
  userId: string
): Promise<SupabaseResult> => {
  try {
    // Build the delete query
    const { error, count } = await supabase
      .from(tableName as any)
      .delete()
      .eq(userIdColumn, userId);
    
    if (error) {
      console.error(`Error deleting ${userId} from ${tableName}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, count };
  } catch (error) {
    console.error(`Error in deleteUserFromTable for ${tableName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Get IDs from related tables for a user
 */
export const getRelatedTableIds = async (
  table: TableInfo,
  userId: string
): Promise<SupabaseResult> => {
  try {
    const relationTable = table.relation || '';
    const userKey = Array.isArray(table.userKey) ? table.userKey[0] : table.userKey || '';
    
    const { data, error } = await supabase
      .from(relationTable as any)
      .select(table.relationKey || 'id')
      .eq(userKey, userId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Update user posts to have deleted status
 */
export const updateUserPosts = async (
  userId: string,
  options = { status: 'deleted' }
): Promise<SupabaseResult> => {
  try {
    const { error, count } = await supabase
      .from('posts')
      .update({ status: options.status, user_id: null })
      .eq('user_id', userId);
    
    if (error) {
      console.error(`Error updating posts for ${userId}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, count };
  } catch (error) {
    console.error(`Error in updateUserPosts for ${userId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
