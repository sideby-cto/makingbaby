import { ComponentType } from "react";

interface DashboardSubHeaderProps {
  title: string;
  subTitle: string;
  color: string;
  Icon: ComponentType<any>;
}

export const DashboardSubHeader: React.FC<DashboardSubHeaderProps> = ({
  title,
  subTitle,
  Icon,
}) => {
  const iconProps = {
    size: "30px",
    className: "p-1 rounded-lg",
  };

  return (
    <div className="flex space-x-3 items-start">
      <Icon {...iconProps} />
      <div>
        <h2 className="text-md text-defaultText font-interMedium">{title}</h2>
        <span className="text-sm text-defaultText font-interMedium">
          {subTitle}
        </span>
      </div>
    </div>
  );
};
