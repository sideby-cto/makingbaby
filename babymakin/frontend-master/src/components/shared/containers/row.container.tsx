import React from "react";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const Row: React.FC<Props> = (props) => (
  <div className={`flex ${props?.className}`}>{props?.children}</div>
);
