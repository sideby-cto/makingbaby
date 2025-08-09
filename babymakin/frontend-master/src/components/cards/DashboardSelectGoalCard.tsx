import React from "react";
import { MdStars } from "react-icons/md";

interface DashboardSelectGoalCardProps {
  title: string;
  selectGoalHandler: (goal: string) => void;
  style?: any;
  iconProps?: {
    color?: string;
    size?: string;
    className?: string;
  };
}

export const DashboardSelectGoalCard: React.FC<
  DashboardSelectGoalCardProps
> = ({ title, selectGoalHandler, style, iconProps }) => (
  <div
    style={style}
    onClick={selectGoalHandler.bind(this, title)}
    className="flex items-center space-x-3 lg:w-fit rounded-lg lg:rounded-xl bg-cardGray p-4 lg:p-3 cursor-pointer "
  >
    <MdStars
      color={iconProps?.color ?? "#FECD70"}
      size={iconProps?.size ?? "15px"}
      className={`${"shrink-0"} ${iconProps?.className}`}
    />
    <span className="text-center font-interMedium">{title}</span>
  </div>
);
