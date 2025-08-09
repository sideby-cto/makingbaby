
import { MigrationResult } from "./types";

// Minimal transcript migration for backward compatibility
// This replaces the deleted feed functionality with minimal implementation

export const migrateTranscriptsToPosts = async (
  transcripts: any[],
  userId: string
): Promise<MigrationResult> => {
  console.log("Transcript migration functionality has been removed");
  return {
    success: true,
    message: "Migration functionality is no longer available",
    data: [],
    migrated: 0
  };
};
