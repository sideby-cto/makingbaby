
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CrewFilter } from "./CrewFilter";

interface UsersGridFiltersProps {
  selectedCommunity: string;
  onCommunityChange: (community: string) => void;
  selectedCrew: string | null;
  onCrewSelect: (crew: string | null) => void;
  showOnlyUnmatched: boolean;
  onUnmatchedToggle: (show: boolean) => void;
  showOnlyReflectionCompleted: boolean;
  onReflectionToggle: (show: boolean) => void;
  showAdminUsers: boolean;
  onAdminUsersToggle: (show: boolean) => void;
  "data-testid"?: string;
}

export const UsersGridFilters: React.FC<UsersGridFiltersProps> = ({
  selectedCommunity,
  onCommunityChange,
  selectedCrew,
  onCrewSelect,
  showOnlyUnmatched,
  onUnmatchedToggle,
  showOnlyReflectionCompleted,
  onReflectionToggle,
  showAdminUsers,
  onAdminUsersToggle,
  "data-testid": testId
}) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg" data-testid={testId || "users-grid-filters"}>
      <div className="flex items-center space-x-2" data-testid="community-filter">
        <Label htmlFor="community-select">Community:</Label>
        <Select value={selectedCommunity} onValueChange={onCommunityChange}>
          <SelectTrigger className="w-[200px]" id="community-select" data-testid="community-select-trigger">
            <SelectValue placeholder="Select community" />
          </SelectTrigger>
          <SelectContent data-testid="community-select-content">
            <SelectItem value="all" data-testid="community-all">All Communities</SelectItem>
            <SelectItem value="educators" data-testid="community-educators">Educators</SelectItem>
            <SelectItem value="administrators" data-testid="community-administrators">Administrators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2" data-testid="crew-filter">
        <Label htmlFor="crew-select">Crew:</Label>
        <CrewFilter 
          selectedCrew={selectedCrew} 
          onCrewSelect={onCrewSelect}
        />
      </div>

      <div className="flex items-center space-x-2" data-testid="reflection-filter">
        <Switch
          id="reflection-completed"
          checked={showOnlyReflectionCompleted}
          onCheckedChange={onReflectionToggle}
          data-testid="reflection-completed-switch"
        />
        <Label htmlFor="reflection-completed">Reflection Completed</Label>
      </div>

      <div className="flex items-center space-x-2" data-testid="admin-users-filter">
        <Switch
          id="show-admin-users"
          checked={showAdminUsers}
          onCheckedChange={onAdminUsersToggle}
          data-testid="show-admin-users-switch"
        />
        <Label htmlFor="show-admin-users">Show Admin Users</Label>
      </div>

      <div className="flex items-center space-x-2" data-testid="unmatched-filter">
        <Switch
          id="show-only-unmatched"
          checked={showOnlyUnmatched}
          onCheckedChange={onUnmatchedToggle}
          data-testid="show-only-unmatched-switch"
        />
        <Label htmlFor="show-only-unmatched">Only Unmatched</Label>
      </div>
    </div>
  );
};
