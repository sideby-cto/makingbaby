
import { PacingLevel } from "../types";
import { Battery, Zap, Flame, Rocket, LucideIcon } from "lucide-react";

export const sendSlackNotification = async (userId: string, pacing: PacingLevel, communityId?: string) => {
  try {
    // This function would send a notification to Slack about a pacing update
    console.log(`User ${userId} updated pacing to ${pacing}${communityId ? ` for community ${communityId}` : ''}`);
    // In a real implementation, you would make an API call to a function that notifies Slack
  } catch (error) {
    console.error("Error sending Slack notification:", error);
  }
};

export const getPacingIcon = (pacing: PacingLevel): LucideIcon => {
  switch (pacing) {
    case "light":
      return Battery;
    case "moderate":
      return Zap;
    case "consistent":
      return Flame;
    case "deep_dive":
      return Rocket;
    default:
      return Zap; // Default icon
  }
};
