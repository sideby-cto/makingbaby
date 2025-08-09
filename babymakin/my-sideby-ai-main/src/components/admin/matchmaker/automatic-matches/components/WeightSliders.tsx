
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MatchingWeights } from "../../hooks";

interface WeightSlidersProps {
  weights: MatchingWeights;
  onWeightChange: (weights: MatchingWeights) => void;
}

export const WeightSliders = ({ weights, onWeightChange }: WeightSlidersProps) => {
  return (
    <div className="space-y-6 md:col-span-3">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Hat Similarity ({Math.round(weights.hatSimilarity * 100)}%)</Label>
        </div>
        <Slider 
          defaultValue={[weights.hatSimilarity * 100]} 
          max={100} 
          step={5}
          onValueChange={(value) => onWeightChange({
            ...weights,
            hatSimilarity: value[0] / 100
          })}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Availability ({Math.round(weights.availability * 100)}%)</Label>
        </div>
        <Slider 
          defaultValue={[weights.availability * 100]} 
          max={100} 
          step={5}
          onValueChange={(value) => onWeightChange({
            ...weights,
            availability: value[0] / 100
          })}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Pacing Compatibility ({Math.round(weights.pacingCompatibility * 100)}%)</Label>
        </div>
        <Slider 
          defaultValue={[weights.pacingCompatibility * 100]} 
          max={100} 
          step={5}
          onValueChange={(value) => onWeightChange({
            ...weights,
            pacingCompatibility: value[0] / 100
          })}
        />
      </div>
    </div>
  );
};
