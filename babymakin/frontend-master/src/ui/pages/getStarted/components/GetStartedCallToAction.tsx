import React, { useMemo } from "react";

interface GetStartedCallToActionProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  isSelected: boolean;
  icon: React.ReactNode;
  subHeader?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  children?: React.ReactNode;
}

const defaultActiveBackgroundColor = "#304A78";
const defaultInactiveBackgroundColor = "#fff";

export const GetStartedCallToAction = ({
  isSelected,
  icon,
  children,
  subHeader,
  activeBackgroundColor = defaultActiveBackgroundColor,
  inactiveBackgroundColor = defaultInactiveBackgroundColor,
  ...props
}: GetStartedCallToActionProps) => {
  const backgroundColor = useMemo(() => {
    if (isSelected) return activeBackgroundColor;
    return inactiveBackgroundColor;
  }, [isSelected, activeBackgroundColor, inactiveBackgroundColor]);

  const textColor = useMemo(() => {
    if (isSelected) return "text-white";
    return "text-black";
  }, [isSelected]);

  return (
    <button
      style={{ backgroundColor, ...props?.style }}
      className="w-[85%] lg:w-72 h-16 rounded-md bg-white flex items-center space-x-2 px-2 cursor-pointer lg:hover:scale-[1.03] hover:drop-shadow-xl transition-all ease-in-out duration-200"
      {...props}
    >
      {icon}
      <div className="space-y-1">
        <h4 className={`font-inter text-sm text-start ${textColor}`}>
          {children}
        </h4>
      </div>
    </button>
  );
};
