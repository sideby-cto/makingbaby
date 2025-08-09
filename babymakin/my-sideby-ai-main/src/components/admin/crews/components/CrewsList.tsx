
import React from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CrewCard } from "./CrewCard";
import { Crew } from "../types";

interface CrewsListProps {
  crews: Crew[];
  loading: boolean;
  onEdit: (crew: Crew) => void;
  onViewMembers: (crew: Crew) => void;
}

export const CrewsList: React.FC<CrewsListProps> = ({ 
  crews, 
  loading, 
  onEdit, 
  onViewMembers 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-24 bg-gray-100"></div>
            <div className="h-12 mt-2 bg-gray-100"></div>
            <div className="h-10 mt-2 bg-gray-100"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (crews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardTitle className="mb-2">No crews found</CardTitle>
        <CardDescription>
          Create your first crew to begin organizing your community
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {crews.map(crew => (
        <CrewCard 
          key={crew.id} 
          crew={crew} 
          onEdit={onEdit} 
          onViewMembers={onViewMembers} 
        />
      ))}
    </div>
  );
};
