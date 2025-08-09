
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Crew } from "../types";

interface CrewCardProps {
  crew: Crew;
  onEdit: (crew: Crew) => void;
  onViewMembers: (crew: Crew) => void;
}

export const CrewCard: React.FC<CrewCardProps> = ({ crew, onEdit, onViewMembers }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{crew.name}</CardTitle>
        <CardDescription>
          Code: <span className="font-mono">{crew.code}</span>
          {crew.lead && (
            <span className="ml-2 text-gray-500">
              Lead: {crew.lead.first_name} {crew.lead.last_name}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-500">
          {crew.description || "No description available"}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => onViewMembers(crew)}
        >
          View Members
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onEdit(crew)}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};
