import React from "react";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

const defaultStyle = "flex";

export const Column: React.FC<Props> = (props) => {
  return (
    <div className={`${defaultStyle} ${props?.className}`}>
      {props?.children}
    </div>
  );
};
