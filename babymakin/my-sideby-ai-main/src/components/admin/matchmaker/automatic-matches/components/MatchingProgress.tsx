
import { Progress } from "@/components/ui/progress";

interface MatchingProgressProps {
  matchingPhase: 'idle' | 'phase1' | 'phase2' | 'complete';
  progress: number;
}

export const MatchingProgress = ({ matchingPhase, progress }: MatchingProgressProps) => {
  if (matchingPhase === 'idle' || matchingPhase === 'complete') return null;
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm">
        <span>
          {matchingPhase === 'phase1' ? 'Finding matches based on hat similarity...' : 'Enhancing matches with availability data...'}
        </span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
};
