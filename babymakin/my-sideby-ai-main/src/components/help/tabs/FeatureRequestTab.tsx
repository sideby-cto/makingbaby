
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, Sparkles } from "lucide-react";

interface FeatureRequestTabProps {
  featureDescription: string;
  setFeatureDescription: (value: string) => void;
  useCase: string;
  setUseCase: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const FeatureRequestTab: React.FC<FeatureRequestTabProps> = ({
  featureDescription,
  setFeatureDescription,
  useCase,
  setUseCase,
  priority,
  setPriority,
  submitting,
  onSubmit,
  onClose
}) => {
  const featureCharacterCount = featureDescription.length;
  const useCaseCharacterCount = useCase.length;
  const isValidFeature = featureDescription.trim().length >= 10;
  const isValidUseCase = useCase.trim().length >= 10;
  const isFormValid = isValidFeature && isValidUseCase;

  const priorityOptions = [
    { value: "low", label: "Low - Nice to have", color: "text-green-600" },
    { value: "medium", label: "Medium - Would be helpful", color: "text-yellow-600" },
    { value: "high", label: "High - Really need this", color: "text-red-600" }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onSubmit(e);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-sideby-orange-100">
            <Lightbulb className="h-5 w-5 text-sideby-orange-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-sideby-text-primary">Request a Feature</h3>
            <p className="text-xs sm:text-sm text-sideby-text-muted mt-1">
              Have an idea for improving sideby? We'd love to hear about it!
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-sideby-orange-50 to-sideby-yellow-50 p-3 sm:p-4 rounded-lg border border-sideby-orange-200/50">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-sideby-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="text-sideby-orange-800 font-medium mb-1">
                Your ideas help shape sideby's future
              </p>
              <p className="text-sideby-orange-700">
                Describe the feature you'd like to see and how it would help you. We review every request and prioritize based on community needs.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="feature-description" className="block text-sm font-semibold text-sideby-text-primary mb-2 sm:mb-3">
              Feature Description *
            </label>
            <Textarea
              id="feature-description"
              value={featureDescription}
              onChange={(e) => setFeatureDescription(e.target.value)}
              placeholder="Describe the feature you'd like to see in detail..."
              className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base border-gray-300 focus:ring-sideby-orange-500 focus:border-sideby-orange-500 rounded-lg resize-none"
              disabled={submitting}
            />
            <div className="flex justify-between items-center text-xs mt-2">
              <span className={featureCharacterCount > 0 && !isValidFeature ? "text-red-500 font-medium" : "text-gray-500"}>
                {!isValidFeature && featureCharacterCount > 0 && "Please enter at least 10 characters"}
              </span>
              <span className="text-gray-400">{featureCharacterCount}/1000</span>
            </div>
          </div>

          <div>
            <label htmlFor="use-case" className="block text-sm font-semibold text-sideby-text-primary mb-2 sm:mb-3">
              How would you use this feature? *
            </label>
            <Textarea
              id="use-case"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="Explain how this feature would help you and when you would use it..."
              className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base border-gray-300 focus:ring-sideby-orange-500 focus:border-sideby-orange-500 rounded-lg resize-none"
              disabled={submitting}
            />
            <div className="flex justify-between items-center text-xs mt-2">
              <span className={useCaseCharacterCount > 0 && !isValidUseCase ? "text-red-500 font-medium" : "text-gray-500"}>
                {!isValidUseCase && useCaseCharacterCount > 0 && "Please enter at least 10 characters"}
              </span>
              <span className="text-gray-400">{useCaseCharacterCount}/1000</span>
            </div>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-sideby-text-primary mb-2 sm:mb-3">
              Priority Level
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sideby-orange-500 focus:border-sideby-orange-500 text-sm sm:text-base"
              disabled={submitting}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Add padding to ensure content is scrollable above buttons */}
        <div className="pb-24 sm:pb-20"></div>
      </div>

      {/* Fixed Button Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 sm:p-6 sticky bottom-0">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 h-12 sm:h-10 text-base sm:text-sm font-medium border-gray-300 hover:bg-gray-50 touch-manipulation"
            disabled={submitting}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting || !isFormValid}
            onClick={handleFormSubmit}
            className="flex-1 h-12 sm:h-10 text-base sm:text-sm font-medium bg-sideby-orange-600 text-white hover:bg-sideby-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Request...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span>Send Feature Request</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
