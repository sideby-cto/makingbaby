
// This file is maintained for backward compatibility 
// It re-exports all functionality from the migrations directory
export { migrateIdeas } from './migrations/ideaMigration';
export type { MigrationResult } from './migrations/types';
export { checkIfFeedItemsMigrated } from './migrations/checkMigrationStatus';
export { getUpduoTranscriptsForMigration } from './migrations/getTranscripts';
export { migrateTranscriptsToPosts } from './migrations/migrateTranscripts';
