
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import React from "react";

interface AddHatButtonProps {
  onClick: () => void;
}

export const AddHatButton: React.FC<AddHatButtonProps> = ({ onClick }) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-7 rounded-full"
    onClick={onClick}
  >
    <PlusCircle className="h-3.5 w-3.5 mr-1" />
    <span className="text-xs">Add</span>
  </Button>
);
