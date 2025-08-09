
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { TableInfo, TableName } from "./types";
import { 
  deleteUserFromTable, 
  getRelatedTableIds,
  updateUserPosts
} from "./tableOperations";
import { 
  findUserByEmail, 
  deleteProfile,
  handleUserPosts,
  callUserPostsDeletionFunction,
  verifyAdminPrivileges
} from "./profileOperations";
import { ResetUserResult } from "./userReset";

// Function to execute the deletion process
export async function executeUserDataDeletion(userExists: { id: string, email: string }): Promise<ResetUserResult> {
  const logs: string[] = [];
  logs.push(`Starting deletion for user ${userExists.email} (${userExists.id})`);
  
  try {
    console.log('Calling database function to remove SideBy data');
    const { error: functionError } = await callUserPostsDeletionFunction(userExists.id);
    
    if (functionError) {
      console.warn('Warning when handling posts:', functionError.message);
      logs.push(`Warning when handling posts: ${functionError.message}`);
    } else {
      console.log('Successfully handled user posts');
      logs.push('Successfully handled user posts');
    }
    
    // Now delete related data in correct order to avoid constraint issues
    const tables: TableInfo[] = [
      { name: "post_visibility", key: 'created_by' },
      { name: "comments", key: 'user_id' },
      { name: "match_meeting_times", key: 'match_id', relation: "matches", relationKey: 'id', userKey: ['user1_id', 'user2_id', 'created_by'] },
      { name: "match_scheduling_messages", key: 'match_id', relation: "matches", relationKey: 'id', userKey: ['user1_id', 'user2_id', 'created_by'] },
      { name: "match_admin_messages", key: 'match_id', relation: "matches", relationKey: 'id', userKey: ['user1_id', 'user2_id', 'created_by'] },
      { name: "match_conversation_analysis", key: 'match_id', relation: "matches", relationKey: 'id', userKey: ['user1_id', 'user2_id', 'created_by'] },
      { name: "matches", key: 'user1_id', altKeys: ['user2_id', 'created_by'] },
      { name: "user_tools", key: 'user_id' },
      { name: "user_pacing_preferences", key: 'user_id' },
      { name: "user_roles", key: 'user_id' },
      { name: "community_members", key: 'user_id' },
      { name: "profile_experiments", key: 'user_id' },
      { name: "user_availability", key: 'user_id' },
      { name: "upduo_transcripts", key: 'user_id' },
      { name: "values_acknowledgment", key: 'id' },
      { name: "process_gaps", key: 'created_by', altKeys: ['closed_by'] },
      { name: "event_participants", key: 'user_id' },
      { name: "engagement_logs", key: 'user_id' },
      { name: "engagement_stats", key: 'user_id' },
      { name: "user_custom_tools", key: 'user_id' },
      { name: "user_session_schedules", key: 'user_id' },
      { name: "sponsorships", key: 'user_id' },
      { name: "resources", key: 'user_id' },
      { name: "connections", key: 'user_id', altKeys: ['connected_user_id'] },
    ];
    
    // First, call Upduo removal function to clean up external service data
    try {
      logs.push('Removing user from Upduo service...');
      const { error: upduoError } = await supabase.functions.invoke('remove-from-upduo', {
        body: { userId: userExists.id }
      });
      
      if (upduoError) {
        logs.push(`Warning when removing from Upduo: ${upduoError.message}`);
      } else {
        logs.push('Successfully removed from Upduo service');
      }
    } catch (err) {
      logs.push(`Error removing from Upduo: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    // Handle special tables that need relation-based deletion
    for (const table of tables) {
      if (table.relation) {
        // First get IDs from relation table that references this user
        const relationIds = await getRelatedTableIds(table, userExists.id);
        
        if (!relationIds.success) {
          logs.push(`Error fetching ${table.relation} IDs: ${relationIds.error}`);
          continue;
        }
        
        if (relationIds.data && relationIds.data.length > 0) {
          const ids = relationIds.data.map((item: any) => item[table.relationKey || 'id']);
          logs.push(`Found ${ids.length} ${table.relation} records to delete from ${table.name}`);
          
          // Delete from the table
          const { error: deleteError } = await supabase
            .from(table.name as any)
            .delete()
            .in(table.key, ids);
            
          if (deleteError) {
            logs.push(`Error deleting from ${table.name}: ${deleteError.message}`);
          } else {
            logs.push(`Successfully deleted from ${table.name}`);
          }
        } else {
          logs.push(`No ${table.relation} records found to delete from ${table.name}`);
        }
      } else {
        // Direct deletion for tables with simple user reference
        const result = await deleteUserFromTable(table.name, table.key, userExists.id);
        
        if (!result.success) {
          logs.push(`Error deleting from ${table.name}: ${result.error}`);
        } else {
          logs.push(`Successfully deleted from ${table.name}`);
        }
        
        // If table has alternate keys, delete those too
        if (table.altKeys) {
          for (const altKey of table.altKeys) {
            const altResult = await deleteUserFromTable(table.name, altKey, userExists.id);
            if (!altResult.success) {
              logs.push(`Error deleting from ${table.name} using ${altKey}: ${altResult.error}`);
            }
          }
        }
      }
    }
    
    // Check and handle any remaining posts
    const { error: postsError } = await handleUserPosts(userExists.id);
    if (postsError) {
      const errorMessage = typeof postsError === 'object' && postsError !== null && 'message' in postsError 
        ? postsError.message 
        : String(postsError);
        
      logs.push(`Error nullifying user_id in posts: ${errorMessage}`);
    } else {
      logs.push('Successfully nullified user_id in posts (if needed)');
    }
    
    // Finally delete the profile itself
    const { error: profileError } = await deleteProfile(userExists.id);
    
    if (profileError) {
      const errorMessage = typeof profileError === 'object' && profileError !== null && 'message' in profileError 
        ? profileError.message 
        : String(profileError);
        
      logs.push(`Error deleting profile: ${errorMessage}`);
      return {
        partialSuccess: true,
        logs,
        message: `Successfully deleted most data but could not remove the profile: ${errorMessage}`
      };
    }
    
    logs.push(`Successfully deleted profile for ${userExists.email}`);
    
    toast({
      title: "User Reset Complete",
      description: `All SideBy data for ${userExists.email} has been reset.`,
    });
    
    return { 
      success: true,
      logs
    };
  } catch (err) {
    console.error("Error in SideBy data deletion:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      logs
    };
  }
}
