
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface IdeasFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  showDiscussionFilters?: boolean;
  showSourceFilters?: boolean;
}

export const IdeasFilter = ({ 
  filter, 
  onFilterChange, 
  showDiscussionFilters = false,
  showSourceFilters = false 
}: IdeasFilterProps) => {
  const filterOptions = [
    { value: "all", label: "All Ideas", description: "Show all your ideas" },
    { value: "excitement-high", label: "High Excitement", description: "Ideas rated 2+ stars for excitement" },
    { value: "alignment-high", label: "High Alignment", description: "Ideas rated 2+ stars for alignment" },
    { value: "unrated", label: "Unrated", description: "Ideas without ratings" },
    ...(showDiscussionFilters ? [
      { value: "with-comments", label: "With Comments", description: "Ideas that have discussions" },
    ] : [])
  ];

  const currentFilter = filterOptions.find(option => option.value === filter);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by:</span>
      </div>
      
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentFilter?.label || "Select filter..."}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filter !== "all" && (
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-secondary/80"
          onClick={() => onFilterChange("all")}
        >
          Clear filter ×
        </Badge>
      )}
    </div>
  );
};
