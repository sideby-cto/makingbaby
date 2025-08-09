
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { HelpDialogHeader } from "./HelpDialogHeader";
import { HelpDialogTabsConfig } from "./HelpDialogTabsConfig";
import { HelpDialogContent } from "./HelpDialogContent";
import { useHelpDialogLogic } from "./hooks/useHelpDialogLogic";

export type { HelpType } from "./types";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpDialog = React.memo<HelpDialogProps>(({ open, onOpenChange }) => {
  const {
    type,
    details,
    featureDescription,
    useCase,
    priority,
    isSubmitting,
    setFeatureDescription,
    setUseCase,
    setPriority,
    handleSubmit,
    handleTypeChange,
    handleDetailsChange,
    handleCloseDialog
  } = useHelpDialogLogic(onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-full sm:h-auto sm:max-h-[95vh] bg-gradient-to-br from-white to-gray-50/50 flex flex-col p-0">
        <div className="flex-shrink-0 px-4 sm:px-6 pt-6 sm:pt-6">
          <HelpDialogHeader />
        </div>

        <div className="flex-1 min-h-0 px-4 sm:px-6 pb-4 sm:pb-6">
          <Tabs 
            defaultValue="bug" 
            value={type} 
            onValueChange={handleTypeChange} 
            className="w-full h-full flex flex-col"
          >
            <div className="flex-shrink-0 mt-4 sm:mt-6">
              <HelpDialogTabsConfig 
                type={type}
                onTypeChange={handleTypeChange}
              />
            </div>

            <div className="flex-1 min-h-0">
              <HelpDialogContent
                type={type}
                details={details}
                featureDescription={featureDescription}
                useCase={useCase}
                priority={priority}
                isSubmitting={isSubmitting}
                setDetails={handleDetailsChange}
                setFeatureDescription={setFeatureDescription}
                setUseCase={setUseCase}
                setPriority={setPriority}
                onSubmit={handleSubmit}
                onClose={handleCloseDialog}
              />
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
});

HelpDialog.displayName = 'HelpDialog';
