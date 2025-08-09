
import { supabase } from "@/integrations/supabase/client";
import { MigrationResult } from "./types";

// Check if the feed items have already been migrated to posts
export const checkIfFeedItemsMigrated = async (): Promise<MigrationResult> => {
  try {
    // Get a count of posts with migration metadata or from Upduo sources
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'upduo_reflection');
      
    if (error) throw error;
    
    // If there are imported posts, we can assume migration has run before
    if (count && count > 0) {
      return {
        success: false,
        message: 'Feed items appear to have been migrated already. There are existing "upduo_reflection" posts.'
      };
    }
    
    return {
      success: true,
      message: 'No existing migrated posts found. Migration can proceed.'
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      success: false,
      message: 'Error checking migration status',
      error
    };
  }
};
