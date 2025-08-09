import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Search, 
  RefreshCw, 
  Zap, 
  Filter,
  UserCheck,
  UserX,
  Crown,
  CheckCircle2,
  Eye
} from "lucide-react";
import { Profile } from "../types/matchmaking";
import { useUserProfilesData } from "../hooks/useUserProfilesData";
import { DirectMatchCreationPanel } from "./DirectMatchCreationPanel";
import { UsersGridFilters } from "./UsersGridFilters";
import { UserCard } from "./UserCard";
import { filterProfiles } from "./UsersGridFilterLogic";
import { useDebounce } from "@/hooks/useDebounce";

interface EnhancedUsersGridProps {
  onMatchCreated?: () => void;
  selectedCommunity?: string;
  compact?: boolean;
}

export const EnhancedUsersGrid: React.FC<EnhancedUsersGridProps> = ({
  onMatchCreated,
  selectedCommunity: initialSelectedCommunity,
  compact = false
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>(initialSelectedCommunity || "all");
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [showOnlyReflectionCompleted, setShowOnlyReflectionCompleted] = useState(true);
  const [showAdminUsers, setShowAdminUsers] = useState(true);
  const [showOnlyUnmatched, setShowOnlyUnmatched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const itemsPerPage = compact ? 16 : 12;

  // Data fetching with caching
  const {
    profiles,
    loading,
    isRefreshing,
    handleRefresh,
    error
  } = useUserProfilesData({ 
    selectedCommunity: selectedCommunity === "all" ? undefined : selectedCommunity,
    selectedCrew,
    includeAdminUsers: true,
    includeDeletedUsers: false
  });

  // Memoized filtering and pagination
  const filteredProfiles = useMemo(() => {
    return filterProfiles(profiles, {
      showAdminUsers,
      showOnlyReflectionCompleted,
      showOnlyUnmatched,
      debouncedSearchTerm
    });
  }, [profiles, showAdminUsers, showOnlyReflectionCompleted, showOnlyUnmatched, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = useMemo(() => {
    return filteredProfiles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProfiles, currentPage, itemsPerPage]);

  // User selection handlers
  const handleUserSelect = useCallback((user: Profile) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else if (prev.length < 2) {
        return [...prev, user];
      }
      return prev;
    });
  }, []);

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const handleClearUsers = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const handleAddUser = useCallback((user: Profile) => {
    setSelectedUsers(prev => {
      if (prev.length >= 2) return prev;
      if (prev.some(u => u.id === user.id)) return prev;
      return [...prev, user];
    });
  }, []);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, showOnlyReflectionCompleted, selectedCrew, showAdminUsers, selectedCommunity, showOnlyUnmatched]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleMatchCreated = useCallback(() => {
    handleClearUsers();
    onMatchCreated?.();
  }, [handleClearUsers, onMatchCreated]);

  // Quick filters
  const quickFilters = [
    {
      label: "Unmatched Only",
      active: showOnlyUnmatched,
      count: profiles.filter(p => (p.count_matches || 0) === 0).length,
      onClick: () => setShowOnlyUnmatched(!showOnlyUnmatched),
      icon: UserX
    },
    {
      label: "Has Reflection",
      active: showOnlyReflectionCompleted,
      count: profiles.filter(p => p.has_completed_reflection).length,
      onClick: () => setShowOnlyReflectionCompleted(!showOnlyReflectionCompleted),
      icon: CheckCircle2
    },
    {
      label: "Admin Users",
      active: showAdminUsers,
      count: profiles.filter(p => p.metadata?.is_admin).length,
      onClick: () => setShowAdminUsers(!showAdminUsers),
      icon: Crown
    }
  ];

  const stats = {
    total: profiles.length,
    filtered: filteredProfiles.length,
    selected: selectedUsers.length,
    unmatched: profiles.filter(p => (p.count_matches || 0) === 0).length
  };

  return (
    <div className="space-y-4">
      {/* Header with stats and controls */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Enhanced User Matchmaker
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{stats.total} users</Badge>
              <Badge variant="secondary">{stats.filtered} filtered</Badge>
              {stats.selected > 0 && (
                <Badge variant="default">{stats.selected} selected</Badge>
              )}
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <UserX className="h-3 w-3" />
              {stats.unmatched} unmatched
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {profiles.filter(p => p.has_completed_reflection).length} with reflection
            </span>
            <span className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              {profiles.filter(p => p.metadata?.is_admin).length} admin users
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and quick actions */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={filter.onClick}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <filter.icon className="h-3 w-3" />
                {filter.label}
                <Badge variant="secondary" className="ml-1 h-4 text-xs">
                  {filter.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <>
              <Separator />
              <UsersGridFilters
                selectedCommunity={selectedCommunity}
                onCommunityChange={setSelectedCommunity}
                selectedCrew={selectedCrew}
                onCrewSelect={setSelectedCrew}
                showOnlyUnmatched={showOnlyUnmatched}
                onUnmatchedToggle={setShowOnlyUnmatched}
                showOnlyReflectionCompleted={showOnlyReflectionCompleted}
                onReflectionToggle={setShowOnlyReflectionCompleted}
                showAdminUsers={showAdminUsers}
                onAdminUsersToggle={setShowAdminUsers}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Users grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Select Users to Match
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-primary/20 animate-pulse" />
                  Loading...
                </span>
              ) : (
                <span>
                  Showing {paginatedProfiles.length} of {filteredProfiles.length} users
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive mb-2">Error loading users</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          ) : paginatedProfiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-lg font-medium mb-2">No users found</div>
              <div className="text-sm text-muted-foreground">
                {filteredProfiles.length === 0 && profiles.length > 0 
                  ? "Try adjusting your filters"
                  : "No users are available for matching"
                }
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProfiles.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`cursor-pointer transition-all ${
                      selectedUsers.some(u => u.id === user.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <UserCard profile={user} onClick={() => handleUserSelect(user)} compact={compact} isDraggable={true} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage <= 3 
                        ? i + 1 
                        : currentPage >= totalPages - 2 
                          ? totalPages - 4 + i 
                          : currentPage - 2 + i;
                      
                      if (page < 1 || page > totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Direct match creation panel */}
      <DirectMatchCreationPanel
        isOpen={true}
        selectedUsers={selectedUsers}
        onRemoveUser={handleRemoveUser}
        onClearUsers={handleClearUsers}
        onMatchCreated={handleMatchCreated}
        onAddUser={handleAddUser}
      />
    </div>
  );
};