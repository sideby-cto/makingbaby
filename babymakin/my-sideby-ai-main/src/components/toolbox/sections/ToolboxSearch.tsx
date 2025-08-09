
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ToolboxSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ToolboxSearch = ({ searchQuery, setSearchQuery }: ToolboxSearchProps) => {
  return (
    <div className="relative max-w-lg mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors duration-200" />
        <Input
          type="text"
          placeholder="Search for tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 h-12 bg-card border border-classroom-border rounded-xl shadow-sm focus:shadow-md focus:border-primary transition-all duration-200 text-base"
        />
      </div>
    </div>
  );
};
