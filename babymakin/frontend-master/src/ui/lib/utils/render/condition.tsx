import React from "react";

interface ConditionProps {
  children: React.ReactNode | React.ReactNode[];
  condition: boolean;
}
export const Condition = ({ condition, children }: ConditionProps) => {
  if (!condition) return null;
  return <>{children}</>;
};
