
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddProcessGapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGap: (description: string) => void;
}

export const AddProcessGapDialog = ({ isOpen, onClose, onAddGap }: AddProcessGapDialogProps) => {
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleAddGap = () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the process gap",
        variant: "destructive",
      });
      return;
    }
    onAddGap(description);
    setDescription("");
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Process Gap</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the process gap..."
          />
        </div>
        <Button onClick={handleAddGap} className="w-full">
          Add Gap
        </Button>
      </div>
    </DialogContent>
  );
};
