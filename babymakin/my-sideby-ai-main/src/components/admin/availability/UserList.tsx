
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, Calendar, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserListItem } from "./UserListItem";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface UserWithAvailability {
  id: string;
  email: string;
  fullName: string;
  hasAvailability: boolean;
  availabilitySlots?: { day: string, hour: number }[];
}

interface UserListProps {
  users: UserWithAvailability[];
  loading: boolean;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onRefresh?: () => void;
}

export const UserList = ({ 
  users, 
  loading, 
  selectedUserId, 
  onSelectUser,
  onRefresh
}: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Count users with availability
  const usersWithAvailability = users.filter(u => u.hasAvailability).length;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Members
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || !onRefresh}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search members..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>
                {usersWithAvailability} of {users.length} members have set availability
              </span>
            </div>
            
            <Separator />
            
            {loading && filteredUsers.length === 0 ? (
              <div className="py-4 text-center text-gray-500 flex flex-col items-center">
                <RefreshCw className="h-5 w-5 animate-spin mb-2 text-purple-600" />
                <span>Loading members...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredUsers.map(user => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    isSelected={selectedUserId === user.id}
                    onSelect={() => onSelectUser(user.id)}
                  />
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="py-4 text-center text-gray-500">
                    No members found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
