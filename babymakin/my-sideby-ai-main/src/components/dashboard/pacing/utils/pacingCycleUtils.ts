
import { PacingLevel } from "../types";

export const calculateCycleProgress = (pacing: PacingLevel) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
  const lastThursday = new Date(today);
  lastThursday.setDate(today.getDate() - ((dayOfWeek - 4 + 7) % 7));
  lastThursday.setHours(0, 0, 0, 0);

  const daysSinceLastThursday = Math.floor(
    (today.getTime() - lastThursday.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Define cycle lengths based on pacing
  const cycleLengths: Record<string, number> = {
    deep_dive: 7, // Weekly cycle
    consistent: 7, // Weekly cycle
    moderate: 14, // Biweekly cycle
    light: 28, // Monthly cycle
  };

  const cycleLength = cycleLengths[pacing] || 7;
  const progress = (daysSinceLastThursday / cycleLength) * 100;

  return Math.min(Math.max(progress, 0), 100); // Ensure progress is between 0 and 100
};

export const getCycleInfo = (pacing: PacingLevel) => {
  switch (pacing) {
    case "deep_dive":
    case "consistent":
      return "Weekly cycle - resets every Thursday";
    case "moderate":
      return "Biweekly cycle - resets every other Thursday";
    case "light":
      return "Monthly cycle - resets on the fourth Thursday";
    default:
      return "";
  }
};

export const formatPacingLabel = (pacing: PacingLevel | null): string => {
  if (!pacing) return "Not Set";
  
  switch (pacing) {
    case "deep_dive":
      return "Deep Dive";
    case "light":
      return "Light";
    case "moderate":
      return "Moderate";
    case "consistent":
      return "Consistent";
    default:
      return "Not Set";
  }
};
