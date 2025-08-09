
import { Battery, Zap, Flame, Rocket } from "lucide-react";
import { PacingOptionType } from "./types";

export const getPacingOptions = (): PacingOptionType[] => {
  return [
    {
      value: "light",
      label: "Monthly",
      description: "Monthly engagement with casual participation",
      icon: Battery,
    },
    {
      value: "moderate",
      label: "Weekly",
      description: "Weekly participation with regular involvement",
      icon: Zap,
    },
    {
      value: "consistent",
      label: "Accelerated",
      description: "Accelerated participation with steady involvement",
      icon: Flame,
    },
    {
      value: "deep_dive",
      label: "Unlimited",
      description: "Coming soon - Premium unlimited access (Join waitlist)",
      icon: Rocket,
    },
  ];
};
