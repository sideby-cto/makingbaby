import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { CommunityMembers } from "./CommunityMembers";

interface CommunityCardHeaderProps {
  name: string;
  description: string | null;
  id: string;
  showMembers: boolean;
  setShowMembers: (show: boolean) => void;
}

export const CommunityCardHeader = ({
  name,
  description,
  id,
  showMembers,
  setShowMembers,
}: CommunityCardHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMembers(!showMembers)}
          className="shrink-0"
        >
          <Users className="h-4 w-4" />
        </Button>
      </div>
      {showMembers && <CommunityMembers communityId={id} />}
    </CardHeader>
  );
};