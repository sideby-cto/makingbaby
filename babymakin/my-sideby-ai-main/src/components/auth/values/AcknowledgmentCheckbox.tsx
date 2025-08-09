
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface AcknowledgmentCheckboxProps {
  acknowledged: boolean;
  setAcknowledged: (acknowledged: boolean) => void;
}

export const AcknowledgmentCheckbox = ({ 
  acknowledged, 
  setAcknowledged 
}: AcknowledgmentCheckboxProps) => {
  return (
    <div 
      className="group cursor-pointer select-none rounded-xl border border-classroom-border bg-white/50 p-6 transition-all duration-200 hover:border-classroom-orange/60 hover:bg-white/80"
      onClick={() => setAcknowledged(!acknowledged)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-1">
          <Checkbox
            id="terms"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
            variant="orange"
            size="md"
            className="pointer-events-none"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="terms"
            className="cursor-pointer text-base font-medium text-classroom-text-secondary leading-relaxed sm:text-lg"
          >
            I acknowledge and agree to uphold these shared values as a member of the{" "}
            <span className="font-semibold text-classroom-orange">sideby</span> community, 
            and I acknowledge that if I cannot adhere to our values and norms or engage 
            in negative or harassing behaviors, I may be removed from our community.
          </label>
        </div>
      </div>
    </div>
  );
};
