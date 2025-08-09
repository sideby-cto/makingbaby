
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X, User, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExperimentSelectorProps {
  profiles?: { id: string; name: string; email: string }[];
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
  loading: boolean;
}

export const ExperimentSelector = ({ 
  profiles = [], 
  selectedUserId, 
  onSelect, 
  loading 
}: ExperimentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);

  // Update filtered profiles when search query or profiles change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = profiles.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
    
    setFilteredProfiles(filtered);
  }, [searchQuery, profiles]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <span className="font-semibold text-primary">
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg border p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center">
        <User className="h-4 w-4 mr-2 text-primary-500" />
        Select User
      </h3>
      
      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 py-5 border-slate-200 focus-visible:ring-primary-500"
          disabled={loading}
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={clearSearch}
          >
            <X className="h-4 w-4 text-gray-400" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="py-4 text-sm text-gray-500 flex items-center justify-center">
          <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
          Loading users...
        </div>
      ) : (
        <>
          <ScrollArea className="h-[300px] pr-4 border rounded-md">
            <div className="p-1 space-y-1">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((user) => (
                  <TooltipProvider key={user.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal py-2.5 text-base",
                            selectedUserId === user.id 
                              ? "bg-primary-100 text-primary-600 font-medium" 
                              : "text-gray-700 hover:bg-slate-50"
                          )}
                          onClick={() => onSelect(user.id)}
                        >
                          <div className="flex flex-col items-start text-left">
                            <div className="flex items-center gap-1">
                              {highlightMatches(user.name, searchQuery)}
                            </div>
                            {searchQuery && user.email.toLowerCase().includes(searchQuery.toLowerCase()) && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {highlightMatches(user.email, searchQuery)}
                              </div>
                            )}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              ) : (
                <div className="py-6 text-sm text-gray-500 flex flex-col items-center justify-center">
                  <Search className="h-5 w-5 mb-2 text-gray-400" />
                  {searchQuery 
                    ? "No users match your search in name or email" 
                    : "No users found"}
                </div>
              )}
            </div>
          </ScrollArea>
          
          {selectedUserId && (
            <Button 
              variant="outline" 
              className="w-full mt-4 border-gray-200"
              onClick={() => onSelect(null)}
            >
              Clear Selection
            </Button>
          )}
        </>
      )}
    </div>
  );
};
