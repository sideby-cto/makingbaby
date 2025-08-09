import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JoinExistingCrewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinExistingCrewModal: React.FC<JoinExistingCrewModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  const handleJoinCrew = () => {
    onOpenChange(false);
    navigate("/crew-code?from=signup");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            Join an Existing Crew?
          </DialogTitle>
          <DialogDescription className="text-left">
            If you have a crew code from your organization or learning community, 
            you can join them first and then complete your registration together.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleJoinCrew} className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Join an existing crew
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Continue with individual signup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};