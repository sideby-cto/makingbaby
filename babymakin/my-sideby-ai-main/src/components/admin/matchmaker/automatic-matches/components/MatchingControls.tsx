
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CommunityFilter } from "../../CommunityFilter";
import { MatchingWeights } from "../../hooks";

interface MatchingControlsProps {
  weights: MatchingWeights;
  onWeightChange: (weights: MatchingWeights) => void;
  selectedCommunity: string;
  onCommunityChange: (community: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const MatchingControls = ({
  weights,
  onWeightChange,
  selectedCommunity,
  onCommunityChange,
  onRefresh,
  loading
}: MatchingControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="community-filter" 
          checked={weights.communityMembership}
          onCheckedChange={(checked) => onWeightChange({
            ...weights,
            communityMembership: checked
          })}
        />
        <Label htmlFor="community-filter">Require Same Community</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="match-preference" 
          checked={weights.preferFewerMatches}
          onCheckedChange={(checked) => onWeightChange({
            ...weights,
            preferFewerMatches: checked
          })}
        />
        <Label htmlFor="match-preference">Prefer Fewer Existing Matches</Label>
      </div>
      
      <div className="mt-4">
        <Label className="mb-2 block">Filter by Community</Label>
        <CommunityFilter 
          selectedCommunity={selectedCommunity} 
          onCommunityChange={onCommunityChange} 
        />
      </div>
      
      <Button 
        className="w-full mt-4" 
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Find Matches
      </Button>
    </div>
  );
};
