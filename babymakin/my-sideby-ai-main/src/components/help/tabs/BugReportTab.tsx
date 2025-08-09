
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2, Bug, AlertTriangle } from "lucide-react";

interface BugReportTabProps {
  details: string;
  setDetails: (value: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const BugReportTab: React.FC<BugReportTabProps> = ({ 
  details, 
  setDetails, 
  submitting,
  onSubmit 
}) => {
  const characterCount = details.length;
  const isValidInput = details.trim().length >= 10;
  const showCharacterWarning = details.length > 0 && !isValidInput;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-red-100">
          <Bug className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-sideby-text-primary">Report a Bug</h3>
          <p className="text-sm text-sideby-text-muted mt-1">
            Help us improve by reporting any issues you've encountered
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-red-800 font-medium mb-1">
              Reporting bugs helps everyone
            </p>
            <p className="text-red-700">
              Please describe what happened, what you expected, and any steps to reproduce the issue. 
              Screenshots or screen recordings are also helpful if you have them.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="bug-details" className="block text-sm font-semibold text-sideby-text-primary mb-3">
            Bug Description *
          </label>
          <Textarea
            id="bug-details"
            placeholder="Please describe the bug you encountered. Include what you were trying to do, what happened, and what you expected to happen instead..."
            required
            minLength={10}
            maxLength={1000}
            className={`min-h-[120px] text-base rounded-lg ${showCharacterWarning ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-sideby-orange-500 focus:border-sideby-orange-500'}`}
            value={details}
            onChange={e => setDetails(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-between items-center text-xs mt-2">
            <span className={showCharacterWarning ? "text-red-500 font-medium" : "text-gray-500"}>
              {showCharacterWarning && "Please enter at least 10 characters"}
            </span>
            <span className="text-gray-400">{characterCount}/1000</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 py-3 text-base font-medium border-gray-300 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={submitting || !isValidInput}
            className="flex-1 py-3 text-base font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Report...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <span>Submit Bug Report</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
