export const BACK_TO_SCHOOL_LAUNCH_DATE = new Date("2025-09-02T12:00:00Z");
export const BACK_TO_SCHOOL_BADGE_ID = "a4fda618-d18f-4e78-b57e-5a143c8312b3";

// Define upcoming badges with their launch dates
export const UPCOMING_BADGES = [
  {
    id: "back-to-school", 
    name: "Back to School Compass",
    description: "Navigate your learning journey with intention and purpose",
    launchDate: BACK_TO_SCHOOL_LAUNCH_DATE,
    estimatedRelease: "September 2025"
  },
  {
    id: "ai-onward",
    name: "AI Onward", 
    description: "Don't fall back - advance your AI integration and maintain momentum in your educational practice",
    launchDate: new Date("2025-10-01T00:00:00Z"),
    estimatedRelease: "October 2025"
  },
  {
    id: "ai-resolutions",
    name: "AI Resolutions",
    description: "New year, new schools, new opportunities - set and achieve meaningful AI-focused goals for educational transformation",
    launchDate: new Date("2026-01-01T00:00:00Z"),
    estimatedRelease: "January 2026"
  },
  {
    id: "ai-refresh",
    name: "AI Refresh",
    description: "Analogous to Spring cleaning - you've learned a lot and the world has changed. Declutter your AI approach to finish strong",
    launchDate: new Date("2026-03-01T00:00:00Z"), 
    estimatedRelease: "March 2026"
  }
];

export const isBackToSchoolLaunched = (): boolean => {
  const now = new Date();
  return now >= BACK_TO_SCHOOL_LAUNCH_DATE;
};

export const getNextUpcomingBadge = () => {
  const now = new Date();
  
  // Filter badges that haven't launched yet and sort by launch date
  const futureBadges = UPCOMING_BADGES
    .filter(badge => badge.launchDate > now)
    .sort((a, b) => a.launchDate.getTime() - b.launchDate.getTime());
  
  return futureBadges.length > 0 ? futureBadges[0] : null;
};

export const getTimeUntilLaunch = (targetDate?: Date) => {
  const now = new Date();
  const launchDate = targetDate || BACK_TO_SCHOOL_LAUNCH_DATE;
  const timeDiff = launchDate.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return null;
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};