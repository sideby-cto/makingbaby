
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  "data-testid"?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing,
  "data-testid": testId
}) => {
  return (
    <div className="flex gap-2" data-testid={testId || "search-bar"}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          data-testid="search-input"
        />
      </div>
      <Button
        onClick={onRefresh}
        variant="outline"
        disabled={isRefreshing}
        data-testid="refresh-button"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
