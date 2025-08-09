
import { MigrationResult } from "./types";
import { checkIfFeedItemsMigrated } from "./checkMigrationStatus";
import { getUpduoTranscriptsForMigration } from "./getTranscripts";
import { migrateTranscriptsToPosts } from "./migrateTranscripts";

// Main migration function that orchestrates the entire process
export const migrateIdeas = async (userId: string): Promise<MigrationResult> => {
  try {
    // First check if migration has already run
    const migrationCheck = await checkIfFeedItemsMigrated();
    if (!migrationCheck.success) {
      return migrationCheck;
    }
    
    // Get transcripts to migrate
    const transcriptsResult = await getUpduoTranscriptsForMigration();
    if (!transcriptsResult.success || !transcriptsResult.data) {
      return transcriptsResult;
    }
    
    // Perform the migration
    const migrationResult = await migrateTranscriptsToPosts(
      transcriptsResult.data,
      userId
    );
    
    return {
      success: migrationResult.success,
      message: migrationResult.message,
      migrated: migrationResult.data?.length || 0,
      data: migrationResult.data
    };
  } catch (error) {
    console.error('Error in migrateIdeas:', error);
    return {
      success: false,
      message: 'Migration process failed',
      error
    };
  }
};

export type { MigrationResult } from "./types";
