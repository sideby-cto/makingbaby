
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, BarChart2 } from "lucide-react";
import React, { useState } from "react";

/**
 * Dialog popup that explains AI inference in user-friendly language,
 * with an optional "more technical" mode that shows a simplified
 * comparison between "training" and "inferring".
 */
interface InferenceInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InferenceInfoDialog = ({ isOpen, onClose }: InferenceInfoDialogProps) => {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Understanding AI Inference
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            AI inference is like making an educated guess based on a conversation. When you completed
            your welcome session, our AI analyzed the conversation to understand your interests and 
            suggest a hat that matches your flow activity.
          </p>
          <p className="text-sm text-muted-foreground">
            Just like how a friend might notice you light up when talking about certain topics, 
            our AI looks for patterns in your conversation to identify what brings you joy and 
            engagement in your teaching practice.
          </p>
          <p className="text-sm text-muted-foreground">
            You can always request a new inference if you feel the AI could better understand 
            your interests, or edit the hat manually to better reflect your focus.
          </p>

          {!showTechnical && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => setShowTechnical(true)}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Go a little more technical
            </Button>
          )}

          {showTechnical && (
            <div className="mt-4 w-full">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Training vs. Inferring in AI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/60 rounded-lg p-3">
                <div>
                  <div className="text-xs uppercase font-bold text-primary mb-1">Training</div>
                  <ul className="pl-3 list-disc text-sm text-muted-foreground">
                    <li>Like a student studying from lots of examples, the AI is "trained" on large amounts of data (books, conversations, etc.).</li>
                    <li>This happens only occasionally, requires lots of computing power, and is done by AI experts.</li>
                    <li>After training, the AI has learned patterns that help it understand new things.</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase font-bold text-primary mb-1">Inferring</div>
                  <ul className="pl-3 list-disc text-sm text-muted-foreground">
                    <li>When you use the AI, it's "inferring"—making predictions based on what it already learned during training.</li>
                    <li>Inference is quick—it's how the AI decides what hat fits you, using what it knows.</li>
                    <li>It does not change the AI's knowledge; it just uses it to make a helpful guess for you.</li>
                  </ul>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setShowTechnical(false)}
              >
                Hide technical details
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
