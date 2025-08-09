
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from "lucide-react";

interface SessionAnalysisBarProps {
  selectedCount: number;
  analyzing: boolean;
  onAnalyze: () => void;
}

export const SessionAnalysisBar = ({ 
  selectedCount, 
  analyzing, 
  onAnalyze 
}: SessionAnalysisBarProps) => {
  return (
    <div className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-brand-tertiary/20 to-brand-secondary/20 rounded-xl border border-brand-primary/20">
      <div className="text-sm font-bold text-foreground">
        {selectedCount > 0 ? (
          <span className="text-brand-primary">
            {selectedCount} session{selectedCount !== 1 ? 's' : ''} selected
          </span>
        ) : (
          <span className="text-muted-foreground">
            Select welcome sessions to analyze for hats
          </span>
        )}
      </div>
      <Button 
        variant="brand" 
        size="sm" 
        onClick={onAnalyze}
        disabled={selectedCount === 0 || analyzing}
        className="flex items-center gap-2 shadow-elegant"
      >
        {analyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
        <span className="font-bold">Analyze for Hats</span>
      </Button>
    </div>
  );
};
