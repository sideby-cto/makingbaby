
import { supabase } from "@/integrations/supabase/client";
import { MigrationResult } from "./types";

// Get Upduo transcripts for migration
export const getUpduoTranscriptsForMigration = async (): Promise<MigrationResult> => {
  try {
    const { data: transcripts, error } = await supabase
      .from('upduo_transcripts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    if (!transcripts || transcripts.length === 0) {
      return {
        success: false,
        message: 'No Upduo transcripts found to migrate'
      };
    }
    
    return {
      success: true,
      message: `Found ${transcripts.length} Upduo transcripts to process`,
      data: transcripts
    };
  } catch (error) {
    console.error('Error fetching Upduo transcripts:', error);
    return {
      success: false,
      message: 'Error fetching transcripts for migration',
      error
    };
  }
};
