
import { useMemo } from "react";
import { SavedItem } from "../types";

interface UseInsightsFilterProps {
  personalIdeas: SavedItem[];
  comments: Record<string, any[]>;
  filter: string;
}

export const useInsightsFilter = ({ personalIdeas, comments, filter }: UseInsightsFilterProps) => {
  const filteredItems = useMemo(() => {
    return personalIdeas.filter(item => {
      if (filter === "all") return true;
      if (filter === "transformative") return (item.excitement_level || 0) >= 3 && (item.alignment_level || 0) >= 3;
      if (filter === "high-impact") return (item.excitement_level || 0) >= 2 && (item.alignment_level || 0) >= 2;
      if (filter === "energizing") return (item.excitement_level || 0) >= 2;
      if (filter === "strategic") return (item.alignment_level || 0) >= 2;
      if (filter === "with-comments") return comments[item.id]?.length > 0;
      return true;
    });
  }, [personalIdeas, filter, comments]);

  const filterOptions = [
    { id: "all", label: "All Ideas", count: personalIdeas.length },
    { id: "transformative", label: "Transformative", 
      count: personalIdeas.filter(item => (item.excitement_level || 0) >= 3 && (item.alignment_level || 0) >= 3).length },
    { id: "high-impact", label: "High Impact", 
      count: personalIdeas.filter(item => (item.excitement_level || 0) >= 2 && (item.alignment_level || 0) >= 2).length },
    { id: "energizing", label: "Energizing", 
      count: personalIdeas.filter(item => (item.excitement_level || 0) >= 2).length },
    { id: "strategic", label: "Strategic", 
      count: personalIdeas.filter(item => (item.alignment_level || 0) >= 2).length },
    { id: "with-comments", label: "With Reflections", 
      count: Object.keys(comments).filter(id => comments[id]?.length > 0).length },
  ];

  return {
    filteredItems,
    filterOptions
  };
};
