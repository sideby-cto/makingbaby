
import React from "react";
import { Button } from "@/components/ui/button";

interface RatingButtonProps {
  isActive: boolean;
  level: number;
  onClick: (e: React.MouseEvent, level: number) => void;
  children: React.ReactNode;
  title: string;
  activeClass?: string;
}

export const RatingButton = ({
  isActive,
  level,
  onClick,
  children,
  title,
  activeClass = ""
}: RatingButtonProps) => {
  return (
    <Button 
      variant={isActive ? "default" : "outline"} 
      size="sm" 
      className={`p-1 h-auto transition-all ${isActive ? activeClass : ""}`}
      title={title}
      onClick={(e) => onClick(e, level)}
    >
      {children}
    </Button>
  );
};
