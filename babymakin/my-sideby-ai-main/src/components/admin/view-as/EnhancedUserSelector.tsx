
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Users, 
  Mail, 
  Calendar,
  Activity,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  journey_stage?: string;
  pacing_level?: string;
  match_count?: number;
  last_activity?: string;
}

interface EnhancedUserSelectorProps {
  users: User[];
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
  loading: boolean;
}

type FilterType = "all" | "recent" | "active" | "new" | "matched";
type SortType = "name" | "created" | "activity" | "matches";

export const EnhancedUserSelector = ({
  users,
  selectedUserId,
  onSelect,
  loading
}: EnhancedUserSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("name");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    switch (filterType) {
      case "recent":
        filtered = filtered.filter(user => {
          if (!user.created_at) return false;
          const daysSinceJoined = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceJoined <= 7;
        });
        break;
      case "active":
        filtered = filtered.filter(user => user.match_count && user.match_count > 0);
        break;
      case "new":
        filtered = filtered.filter(user => user.journey_stage === "new" || !user.journey_stage);
        break;
      case "matched":
        filtered = filtered.filter(user => user.match_count && user.match_count > 0);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortType) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "activity":
          if (!a.last_activity || !b.last_activity) return 0;
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        case "matches":
          return (b.match_count || 0) - (a.match_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, searchQuery, filterType, sortType]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Enhanced User Selection
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-7 px-2"
          >
            <Filter className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-8 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2">
            <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="recent">Recent (7 days)</SelectItem>
                <SelectItem value="active">Has Matches</SelectItem>
                <SelectItem value="new">New Users</SelectItem>
                <SelectItem value="matched">Matched Users</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortType} onValueChange={(value: SortType) => setSortType(value)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="created">Sort by Join Date</SelectItem>
                <SelectItem value="activity">Sort by Activity</SelectItem>
                <SelectItem value="matches">Sort by Matches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredAndSortedUsers.length} users found</span>
          {filterType !== "all" && (
            <Badge variant="outline" className="h-4 px-1 text-xs">
              {filterType}
            </Badge>
          )}
        </div>

        {/* User List */}
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading users...
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start p-2 h-auto text-left",
                      selectedUserId === user.id 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => onSelect(user.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {highlightMatches(user.name, searchQuery)}
                        </span>
                        {user.match_count && user.match_count > 0 && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            {user.match_count}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-2 w-2" />
                          <span className="truncate max-w-[120px]">
                            {highlightMatches(user.email, searchQuery)}
                          </span>
                        </div>
                        
                        {user.created_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-2 w-2" />
                            <span>{formatDate(user.created_at)}</span>
                          </div>
                        )}
                        
                        {user.journey_stage && (
                          <Badge variant="secondary" className="h-3 px-1 text-xs">
                            {user.journey_stage}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  {searchQuery ? "No users match your search" : "No users found"}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Clear Selection Button */}
        {selectedUserId && (
          <Button 
            variant="outline" 
            className="w-full h-7 text-xs"
            onClick={() => onSelect(null)}
          >
            Clear Selection
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
