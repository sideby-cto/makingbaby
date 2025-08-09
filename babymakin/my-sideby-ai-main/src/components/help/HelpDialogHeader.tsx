
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QuestionIcon from "@/components/icons/Sideby_GraphicElements_Icon_Question.svg";

export const HelpDialogHeader: React.FC = () => {
  return (
    <DialogHeader className="space-y-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-sideby-orange-100 to-sideby-orange-50 border border-sideby-orange-200">
          <img src={QuestionIcon} alt="Question" className="w-6 h-6" />
        </div>
        <DialogTitle className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-sideby-orange-600 to-sideby-orange-500 bg-clip-text text-transparent">
            How can we help?
          </span>
        </DialogTitle>
      </div>
      <DialogDescription className="text-base text-sideby-text-muted max-w-md mx-auto leading-relaxed">
        Find help, report issues, request features, or explore our community values. 
        Your feedback helps make sideby better for everyone.
      </DialogDescription>
    </DialogHeader>
  );
};
