
// Define shared types used across migration utilities
export interface MigrationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  migrated?: number;
}
