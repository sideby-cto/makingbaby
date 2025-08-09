
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ChatRationaleProps {
  rationale: string;
}

export const ChatRationale: React.FC<ChatRationaleProps> = ({ rationale }) => {
  if (!rationale) return null;
  
  return (
    <div className="p-3">
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-3 text-sm">
          <h4 className="font-medium text-purple-700 mb-1">Match Rationale:</h4>
          <p className="text-purple-900">{rationale}</p>
        </CardContent>
      </Card>
    </div>
  );
};
