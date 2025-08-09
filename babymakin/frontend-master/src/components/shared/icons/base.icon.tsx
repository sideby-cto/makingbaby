import React from "react";

interface Props {
  active?: boolean;
  ActiveIcon?: any;
  InactiveIcon?: any;
  onClick?: (e?: any) => void;
  className?: string;
}

export const BaseIcon: React.FC<Props> = ({
  ActiveIcon,
  InactiveIcon,
  onClick,
  className,
  active,
}) => (
  <div onClick={onClick} className={className}>
    {active ? <ActiveIcon /> : <InactiveIcon />}
  </div>
);
