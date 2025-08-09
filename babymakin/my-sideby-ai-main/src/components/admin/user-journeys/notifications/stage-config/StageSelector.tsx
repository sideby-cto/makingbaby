
import React from "react";
import { Button } from "@/components/ui/button";

interface StageSelectorProps {
  stages: any[];
  selectedStage: string | null;
  onSelectStage: (stage: string) => void;
}

export function StageSelector({ stages, selectedStage, onSelectStage }: StageSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {stages.map((stage) => (
        <Button
          key={stage.stage}
          variant={selectedStage === stage.stage ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectStage(stage.stage)}
          className="capitalize"
        >
          {stage.label || stage.stage.replace('_', ' ')}
        </Button>
      ))}
    </div>
  );
}
