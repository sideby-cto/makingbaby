
import React from "react";

/**
 * Get human-readable label for excitement level
 */
export const getExcitementLabel = (level: number): string => {
  switch (level) {
    case 1: return "Mild Interest";
    case 2: return "Exciting";
    case 3: return "Game Changer";
    default: return "Not rated";
  }
};

/**
 * Get human-readable label for alignment level
 */
export const getAlignmentLabel = (level: number): string => {
  switch (level) {
    case 1: return "Somewhat Aligned";
    case 2: return "Well Aligned";
    case 3: return "Perfect Fit";
    default: return "Not rated";
  }
};

// Note: Icon helper functions removed as we're now using text labels
// These functions are kept for backward compatibility but are no longer used
export const getExcitementIcon = () => null;
export const getAlignmentIcon = () => null;
