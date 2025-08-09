import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import type { ProfileExperiment } from "@/types/experiments";

interface GutsVsFearSectionProps {
  experiment: ProfileExperiment;
  onSaveToIdeas: (content: string) => Promise<void>;
}

export const GutsVsFearSection = ({ experiment, onSaveToIdeas }: GutsVsFearSectionProps) => {
  if (experiment.experiment_type !== 'guts_vs_fear') return null;

  const renderSaveButton = (content: string) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onSaveToIdeas(content)}
      className="ml-2"
    >
      <BookmarkPlus className="h-4 w-4 mr-2" />
      Save to Ideas
    </Button>
  );

  return (
    <>
      {experiment.excitement_areas && experiment.excitement_areas.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm mb-2">Areas of Excitement</h4>
            {renderSaveButton(experiment.excitement_areas.join(', '))}
          </div>
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-green-50">
            {experiment.excitement_areas.map((area, i) => (
              <span 
                key={i} 
                className="text-sm bg-white text-green-700 px-3 py-1 rounded-full border border-green-300 font-medium shadow-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {experiment.caution_areas && experiment.caution_areas.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm mb-2">Areas of Caution</h4>
            {renderSaveButton(experiment.caution_areas.join(', '))}
          </div>
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-amber-50">
            {experiment.caution_areas.map((area, i) => (
              <span 
                key={i} 
                className="text-sm bg-white text-amber-700 px-3 py-1 rounded-full border border-amber-300 font-medium shadow-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {experiment.moment_of_brilliance && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm mb-2">Moment of Brilliance</h4>
            {renderSaveButton(experiment.moment_of_brilliance)}
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-sm text-blue-700">
            "{experiment.moment_of_brilliance}"
          </div>
        </div>
      )}
    </>
  );
};
