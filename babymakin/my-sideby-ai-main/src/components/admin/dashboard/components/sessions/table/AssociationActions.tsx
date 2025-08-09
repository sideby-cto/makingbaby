import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { useUpduoAssociations } from "@/hooks/useUpduoAssociations";
import { UpduoUser } from "@/types/upduo";

interface AssociationActionsProps {
  upduoUser: UpduoUser;
  onAssociationCreated?: () => void;
}

export const AssociationActions = ({ upduoUser, onAssociationCreated }: AssociationActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSidebyUser, setSelectedSidebyUser] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { sidebyProfiles, createAssociation, searchByName } = useUpduoAssociations();

  const handleSearch = async () => {
    const result = await searchByName.mutateAsync({
      firstName: upduoUser.firstName,
      lastName: upduoUser.lastName
    });

    if (result.success && result.matches) {
      setSearchResults(result.matches);
      setShowSearchResults(true);
    }
  };

  const handleCreateAssociation = async () => {
    if (!selectedSidebyUser) return;

    await createAssociation.mutateAsync({
      sideby_user_id: selectedSidebyUser,
      upduo_user_id: upduoUser.id,
      upduo_first_name: upduoUser.firstName,
      upduo_last_name: upduoUser.lastName
    });

    setIsOpen(false);
    setSelectedSidebyUser("");
    setShowSearchResults(false);
    setSearchResults([]);
    onAssociationCreated?.();
  };

  const handleSelectSearchResult = (result: any) => {
    setSelectedSidebyUser(result.sidebyUserId);
    setShowSearchResults(false);
  };

  const selectedProfile = sidebyProfiles?.find(p => p.id === selectedSidebyUser);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          <UserPlus className="h-3 w-3 mr-1" />
          Associate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Associate Upduo User</DialogTitle>
          <DialogDescription>
            Associate {upduoUser.firstName} {upduoUser.lastName} with a sideby member
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">Upduo User</div>
            <div className="text-xs text-muted-foreground">
              {upduoUser.firstName} {upduoUser.lastName} (ID: {upduoUser.id})
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSearch}
                disabled={searchByName.isPending}
                className="flex-1"
              >
                {searchByName.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Search className="h-4 w-4 mr-1" />
                )}
                Find by Name
              </Button>
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="text-sm font-medium">Search Results:</div>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">
                          {result.sidebyFirstName} {result.sidebyLastName}
                        </span>
                        <Badge variant={result.matchType === 'exact' ? 'default' : 'secondary'} className="text-xs">
                          {result.matchType}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.sidebyEmail}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(result.confidenceScore * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium">Or select manually:</div>
              <Select value={selectedSidebyUser} onValueChange={setSelectedSidebyUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sideby member" />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {sidebyProfiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.first_name} {profile.last_name} ({profile.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfile && (
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <div className="text-sm font-medium text-green-800">Selected:</div>
                <div className="text-xs text-green-600">
                  {selectedProfile.first_name} {selectedProfile.last_name} ({selectedProfile.email})
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssociation}
              disabled={!selectedSidebyUser || createAssociation.isPending}
              className="flex-1"
            >
              {createAssociation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};