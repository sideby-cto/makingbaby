
import React from "react";
import { Badge } from "@/components/ui/badge";

interface SessionTypeProps {
  type: "PAIR" | "SINGLE" | "peer-learning" | "reflection";
}

export const SessionType = ({ type }: SessionTypeProps) => {
  if (type === "PAIR" || type === "peer-learning") {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
        Learning
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
      Reflection
    </Badge>
  );
};
