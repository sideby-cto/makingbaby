
import { useCommunities } from "@/hooks/useCommunities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MatchmakerCommunityFilterProps {
  selectedCommunity: string;
  onCommunityChange: (value: string) => void;
  className?: string;
}

export const MatchmakerCommunityFilter = ({ 
  selectedCommunity, 
  onCommunityChange,
  className = ""
}: MatchmakerCommunityFilterProps) => {
  const { communities } = useCommunities();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="community-filter" className="text-sm font-medium">
        Community
      </Label>
      <Select
        value={selectedCommunity}
        onValueChange={onCommunityChange}
      >
        <SelectTrigger className="w-[180px]" id="community-filter">
          <SelectValue placeholder="All Communities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Communities</SelectItem>
          {communities.map((community) => (
            <SelectItem key={community.id} value={community.id}>
              {community.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
