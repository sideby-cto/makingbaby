
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DoodlePollDialog } from "./DoodlePollDialog";

interface DoodlePollButtonProps {
  matchId?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary";
}

export const DoodlePollButton: React.FC<DoodlePollButtonProps> = ({
  matchId,
  className = "",
  variant = "outline"
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleOpenBooking = () => {
    setIsLoading(true);
    setDialogOpen(true);
    // Simulate loading to ensure iframe has time to load
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <>
      <Button 
        variant={variant}
        onClick={handleOpenBooking}
        className={`flex items-center gap-2 ${className}`}
      >
        <Calendar className="h-5 w-5" />
        <span>Schedule Meeting</span>
      </Button>
      
      <DoodlePollDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        isLoading={isLoading}
        matchId={matchId}
      />
    </>
  );
};
