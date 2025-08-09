
import { Badge } from "@/components/ui/badge";
import type { ProfileExperiment } from "@/types/experiments";

interface SuggestedHatsSectionProps {
  experiment: ProfileExperiment;
  secondOpinion?: Pick<ProfileExperiment, 'suggested_hats'> | null;
  processingUserId: string | null;
}

export const SuggestedHatsSection = ({ 
  experiment, 
  secondOpinion,
  processingUserId
}: SuggestedHatsSectionProps) => {
  if (!experiment.suggested_hats?.length) return null;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium mb-2">Suggested Role(s)</h4>
        <div className="flex flex-wrap gap-2">
          {experiment.suggested_hats.map((hat) => (
            <Badge 
              key={hat} 
              variant="secondary" 
              className="bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 px-4 py-1"
            >
              {hat}
            </Badge>
          ))}
        </div>
      </div>

      {secondOpinion && secondOpinion.suggested_hats && secondOpinion.suggested_hats.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 text-sm text-orange-700">Second Opinion</h4>
          <div className="flex flex-wrap gap-2">
            {secondOpinion.suggested_hats.map((hat) => (
              <Badge 
                key={hat} 
                variant="outline" 
                className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 px-4 py-1"
              >
                {hat}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
