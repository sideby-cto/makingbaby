
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ContactTabProps {
  details: string;
  setDetails: (value: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ContactTab: React.FC<ContactTabProps> = ({ 
  details, 
  setDetails, 
  submitting,
  onSubmit 
}) => {
  const characterCount = details.length;
  const isValidInput = details.trim().length >= 10;
  const showCharacterWarning = details.length > 0 && !isValidInput;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="How can we help you?"
          required
          minLength={10}
          maxLength={1000}
          className={`min-h-[150px] text-base mb-1 ${showCharacterWarning ? 'border-red-300 focus:ring-red-300' : ''}`}
          value={details}
          onChange={e => setDetails(e.target.value)}
          disabled={submitting}
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className={showCharacterWarning ? "text-red-500" : ""}>
            {showCharacterWarning && "Please enter at least 10 characters"}
          </span>
          <span className="text-right">{characterCount}/1000</span>
        </div>
      </div>
      <div className="flex flex-row space-x-2 justify-between">
        <Button
          type="submit"
          disabled={submitting || !isValidInput}
          className="flex-1 bg-[#FF5733] hover:bg-[#FF5733]/90"
        >
          {submitting ? (
            <div className="flex items-center gap-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending...</span>
            </div>
          ) : "Contact Support"}
        </Button>
        <DialogClose asChild>
          <Button type="button" variant="outline" className="flex-1">
            Cancel
          </Button>
        </DialogClose>
      </div>
    </form>
  );
};
