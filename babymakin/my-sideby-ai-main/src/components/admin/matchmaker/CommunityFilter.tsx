
import { useCommunities } from "@/hooks/useCommunities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";

interface Community {
  id: string;
  name: string;
}

interface CommunityFilterProps {
  selectedCommunity: string;
  onChange?: Dispatch<SetStateAction<string>>;
  onCommunityChange?: Dispatch<SetStateAction<string>>;
  communities?: Community[];
}

export const CommunityFilter = ({ 
  selectedCommunity, 
  onChange, 
  onCommunityChange,
  communities: propCommunities
}: CommunityFilterProps) => {
  const { communities: hookCommunities } = useCommunities();
  const communities = propCommunities || hookCommunities;
  
  const handleChange = (value: string) => {
    if (onChange) onChange(value);
    if (onCommunityChange) onCommunityChange(value);
  };

  return (
    <Select
      value={selectedCommunity}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Community" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Members</SelectItem>
        {communities.map((community) => (
          <SelectItem key={community.id} value={community.id}>
            {community.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
