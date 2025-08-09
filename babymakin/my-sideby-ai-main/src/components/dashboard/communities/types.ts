
import { LucideIcon } from "lucide-react";

// Updated to handle both the TypeScript union type and the database type
export type PacingLevel = "light" | "moderate" | "consistent" | "deep_dive";
export type DatabasePacingLevel = string; // Changed from fixed string to match DB TEXT type

export interface PacingDescription {
  light_description: string;
  moderate_description: string;
  consistent_description: string;
  deep_dive_description: string;
}

export interface PacingOptionType {
  value: PacingLevel;
  label: string;
  description: string;
  icon: LucideIcon;
}

// Helper functions to convert between app and database formats
export function pacingLevelToDatabase(level: PacingLevel): DatabasePacingLevel {
  // Simply return the level as a string since we now store it directly as TEXT
  return level;
}

export function databaseToPacingLevel(dbLevel: DatabasePacingLevel): PacingLevel {
  if (!dbLevel) return "light";
  
  // If it contains commas (old format), take the first value, otherwise use as is
  return dbLevel.includes(',') 
    ? dbLevel.split(',')[0] as PacingLevel 
    : dbLevel as PacingLevel;
}
