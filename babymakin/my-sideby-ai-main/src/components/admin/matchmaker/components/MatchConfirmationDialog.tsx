
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Profile } from "../types/matchmaking";

interface MatchConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user1: Profile;
  user2: Profile;
  onConfirm: (rationale: string) => void;
  isCreating: boolean;
  rationale?: string;
  defaultRationale?: string;
  matchType?: string;
}

export const MatchConfirmationDialog = ({
  open,
  onOpenChange,
  user1,
  user2,
  onConfirm,
  isCreating,
  rationale = "",
  defaultRationale = "",
  matchType = "manual"
}: MatchConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm(rationale || defaultRationale || "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Match Creation</DialogTitle>
          <DialogDescription>
            You are about to create a match between these users
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="font-medium">User 1</div>
            <div className="text-sm">{user1.first_name} {user1.last_name}</div>
            <div className="text-sm text-gray-500">{user1.email}</div>
          </div>

          <div className="grid gap-2">
            <div className="font-medium">User 2</div>
            <div className="text-sm">{user2.first_name} {user2.last_name}</div>
            <div className="text-sm text-gray-500">{user2.email}</div>
          </div>

          {(rationale || defaultRationale) && (
            <div className="grid gap-2">
              <div className="font-medium">Match Rationale</div>
              <div className="text-sm bg-gray-50 p-3 rounded border">
                {rationale || defaultRationale}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Match"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
