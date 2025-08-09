
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CrewMembersList } from "../members/CrewMembersList";
import { CrewUpduoTagManager } from "./CrewUpduoTagManager";
import { Crew } from "../types";

interface CrewMembersViewProps {
  crew: Crew;
  onBack: () => void;
  onUpdate?: (crew: Crew) => Promise<void>;
}

export const CrewMembersView: React.FC<CrewMembersViewProps> = ({ 
  crew, 
  onBack,
  onUpdate = async () => {}
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Crews
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{crew.name}</h2>
          <p className="text-muted-foreground">Crew Code: {crew.code}</p>
        </div>
      </div>

      <CrewUpduoTagManager crew={crew} onUpdate={onUpdate} />
      
      <CrewMembersList crewId={crew.id} />
    </div>
  );
};
