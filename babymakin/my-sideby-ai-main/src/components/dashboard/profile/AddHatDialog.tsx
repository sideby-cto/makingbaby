
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Info } from "lucide-react";
import { InferenceInfoDialog } from "./InferenceInfoDialog";

interface AddHatDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (hatName: string) => void;
  isAiInferred?: boolean;
  suggestedHat?: string;
}

export const AddHatDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSave,
  isAiInferred,
  suggestedHat 
}: AddHatDialogProps) => {
  const [hatName, setHatName] = useState("");
  const [showInferenceInfo, setShowInferenceInfo] = useState(false);

  // Update hatName when suggestedHat changes or dialog opens
  useEffect(() => {
    if (isOpen && suggestedHat) {
      setHatName(suggestedHat);
    }
  }, [suggestedHat, isOpen]);

  const handleSave = () => {
    if (hatName.trim()) {
      onSave(hatName.trim());
      setHatName("");
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a New Hat</DialogTitle>
            <DialogDescription>
              Hats represent your interests and expertise in education.
              {isAiInferred && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-muted-foreground"
                  onClick={() => setShowInferenceInfo(true)}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Learn about AI inference
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {suggestedHat && (
                <div className="text-sm text-muted-foreground mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Suggested hat based on your welcome session
                </div>
              )}
              <Input
                id="hat"
                placeholder="Enter your hat name..."
                value={hatName}
                onChange={(e) => setHatName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSave}
              disabled={!hatName.trim()}
            >
              Save Hat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InferenceInfoDialog
        isOpen={showInferenceInfo}
        onClose={() => setShowInferenceInfo(false)}
      />
    </>
  );
};
