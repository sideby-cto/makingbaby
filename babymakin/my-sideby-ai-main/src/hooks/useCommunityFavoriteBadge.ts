import { useState, useEffect } from "react";

// Tools that can be community favorites
const COMMUNITY_FAVORITE_TOOLS = [
  'descript',
  'chatgpt_plus', 
  'lovable_dev'
];

// How often to cycle the badge (in milliseconds) - 24 hours
const CYCLE_INTERVAL = 24 * 60 * 60 * 1000;

export const useCommunityFavoriteBadge = () => {
  const [currentFavorite, setCurrentFavorite] = useState<string>('descript');

  useEffect(() => {
    // Initialize with the current date-based selection
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const toolIndex = dayOfYear % COMMUNITY_FAVORITE_TOOLS.length;
    setCurrentFavorite(COMMUNITY_FAVORITE_TOOLS[toolIndex]);

    // Set up interval to cycle the badge
    const interval = setInterval(() => {
      const now = new Date();
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const toolIndex = dayOfYear % COMMUNITY_FAVORITE_TOOLS.length;
      setCurrentFavorite(COMMUNITY_FAVORITE_TOOLS[toolIndex]);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const isCommunityFavorite = (toolType: string) => {
    return toolType === currentFavorite;
  };

  return { isCommunityFavorite, currentFavorite };
};