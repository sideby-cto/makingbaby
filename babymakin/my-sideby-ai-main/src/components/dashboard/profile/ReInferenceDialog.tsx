
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface ReInferenceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const ReInferenceDialog: React.FC<ReInferenceDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isProcessing
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <Brain className="h-6 w-6 text-blue-500" />
        <h4 className="font-semibold text-lg mb-1">Request new inference</h4>
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          We'll analyze your welcome session again and suggest a new AI-inferred hat.
        </p>
        <Button
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Requesting..." : "Request new inference"}
        </Button>
      </div>
    </div>
  );
};
