
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Archive, RefreshCw } from "lucide-react";
import type { ProfileSubjectStatus } from "@/types/profile";

interface HatStatusManagerProps {
  hatName: string;
  currentStatus: string;
  onStatusChange: (hatName: string, newStatus: ProfileSubjectStatus["status"]) => void;
  disabled?: boolean;
}

export const HatStatusManager: React.FC<HatStatusManagerProps> = ({
  hatName,
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const isOldHat = currentStatus === "old_hat";
  const isActive = currentStatus === "active";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4" disabled={disabled} aria-label={`Manage status for ${hatName}`}>
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isActive && (
          <DropdownMenuItem
            onClick={() => onStatusChange(hatName, "old_hat")}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Mark as Old Hat
          </DropdownMenuItem>
        )}
        {isOldHat && (
          <DropdownMenuItem
            onClick={() => onStatusChange(hatName, "active")}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Mark as Active
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

