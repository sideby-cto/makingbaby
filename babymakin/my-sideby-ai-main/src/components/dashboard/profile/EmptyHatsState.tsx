
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertCircle } from "lucide-react";
import React from "react";

interface EmptyHatsStateProps {
  onAdd: () => void;
}

export const EmptyHatsState: React.FC<EmptyHatsStateProps> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center text-center py-3">
    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
    <p className="text-muted-foreground text-sm mb-3">
      You haven't added any hats yet. Hats represent your interests and skills.
    </p>
    <Button variant="outline" size="sm" onClick={onAdd}>
      <PlusCircle className="h-4 w-4 mr-2" />
      Add My First Hat
    </Button>
  </div>
);
