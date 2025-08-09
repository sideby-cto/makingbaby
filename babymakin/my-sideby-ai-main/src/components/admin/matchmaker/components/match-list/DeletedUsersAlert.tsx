
import React from "react";
import { Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DeletedUsersAlertProps {
  matchesWithDeletedUsers: number;
  showDeletedUsers: boolean;
  setShowDeletedUsers: (value: boolean) => void;
}

export const DeletedUsersAlert: React.FC<DeletedUsersAlertProps> = ({
  matchesWithDeletedUsers,
  showDeletedUsers,
  setShowDeletedUsers,
}) => {
  if (matchesWithDeletedUsers === 0) {
    return null;
  }

  return (
    <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Some matches have deleted users</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span className="text-amber-700">
          {matchesWithDeletedUsers} {matchesWithDeletedUsers === 1 ? 'match has' : 'matches have'} users that are no longer available.
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="self-start border-amber-500 text-amber-700 hover:bg-amber-100" 
          onClick={() => setShowDeletedUsers(!showDeletedUsers)}
        >
          {showDeletedUsers ? 'Hide' : 'Show'} matches with deleted users
        </Button>
      </AlertDescription>
    </Alert>
  );
};
