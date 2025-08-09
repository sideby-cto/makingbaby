
import { PacingSelector } from "./PacingSelector";
import { CollapsedPacingView } from "./CollapsedPacingView";
import { PacingExplanationVideo } from "./PacingExplanationVideo";
import { usePacingUpdate } from "./hooks/usePacingUpdate";
import { getPacingIcon } from "./utils/pacingUtils";
import { getPacingOptions } from "./PacingOptionsConfig";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PacingLevel } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CommunityPacingProps {
  communityId: string;
  userId?: string;
  globalPacing?: boolean;
}

export const CommunityPacing = ({ communityId, userId, globalPacing = false }: CommunityPacingProps) => {
  const {
    userPacing,
    isCollapsed,
    setIsCollapsed,
    handlePacingSelect
  } = usePacingUpdate(communityId, userId, globalPacing);
  
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [pendingPacingSelection, setPendingPacingSelection] = useState<PacingLevel | null>(null);
  const { toast } = useToast();

  const handlePacingChange = (pacing: PacingLevel) => {
    // If selecting premium pace, show dialog
    if (pacing === "deep_dive") {
      setPendingPacingSelection(pacing);
      setShowPremiumDialog(true);
    } else {
      // For non-premium paces, proceed normally
      handlePacingSelect(pacing);
    }
  };

  const handlePremiumConfirm = () => {
    if (pendingPacingSelection) {
      handlePacingSelect(pendingPacingSelection);
      toast({
        title: "Premium Pace Selected",
        description: "You will be charged $10/month for the Deep Dive premium pace.",
      });
    }
    setShowPremiumDialog(false);
  };

  if (isCollapsed && userPacing) {
    return (
      <CollapsedPacingView
        icon={getPacingIcon(userPacing)}
        label={userPacing}
        onEdit={() => setIsCollapsed(false)}
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Set Your Learning Pace</h3>
          <PacingExplanationVideo />
        </div>
        
        <PacingSelector
          selectedPacing={userPacing}
          pacingOptions={getPacingOptions()}
          onPacingChange={handlePacingChange}
        />
      </div>

      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Premium Pace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>The Deep Dive pace offers our most intensive learning experience:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Thrice weekly participation</li>
              <li>Priority matching with expert partners</li>
              <li>Advanced analytics and insights</li>
              <li>Dedicated support</li>
            </ul>
            <p className="mt-4 font-medium">This premium option costs $10/month.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>Cancel</Button>
            <Button onClick={handlePremiumConfirm} className="bg-amber-500 hover:bg-amber-600">
              Confirm ($10/month)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
