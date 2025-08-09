
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newMemberEmail: string;
  onEmailChange: (email: string) => void;
  onAddMember: () => Promise<void>;
  isProcessing: boolean;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  isOpen,
  onOpenChange,
  newMemberEmail,
  onEmailChange,
  onAddMember,
  isProcessing
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Crew Member</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to add to the crew
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">Email Address</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="user@example.com"
              value={newMemberEmail}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#FF5733] hover:bg-[#FF5733]/90"
            onClick={onAddMember}
            disabled={!newMemberEmail || isProcessing}
          >
            {isProcessing ? "Adding..." : "Add Member"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
