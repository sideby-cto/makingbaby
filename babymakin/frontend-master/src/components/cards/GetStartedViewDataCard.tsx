import React from "react";
import { IoMdSchool } from "react-icons/io";
import { GiModernCity } from "react-icons/gi";

interface Props {
  type: "school" | "district";
  onClickHandler?: (e?: any) => void;
  selected?: boolean;
  defaultColor?: string;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  iconProps?: {
    activeColor?: string;
    inactiveColor?: string;
    activeTintColor?: string;
    inactiveTintColor?: string;
    defaultIconColor?: string;
  };
}

export const GetStartedViewDataCard: React.FC<Props> = (props) => {
  const isSelected = props?.selected === true;

  /**@Style */
  const textColor = isSelected ? "text-white" : "text-black";
  const backgroundColor = isSelected
    ? props?.activeBackgroundColor ?? "#304A78"
    : props?.inactiveBackgroundColor ?? "#fff";
  const iconBackgroundColor = isSelected
    ? props?.iconProps?.activeTintColor ?? "#fff"
    : props?.iconProps?.inactiveTintColor ?? "#E7EDE6";

  const renderIcon = () => {
    return props.type === "school" ? (
      <IoMdSchool
        style={{ backgroundColor: iconBackgroundColor }}
        size="2.7rem"
        color={props?.iconProps?.defaultIconColor}
        className={`p-3 rounded-xl`}
      />
    ) : (
      <GiModernCity
        size="50px"
        color={props?.iconProps?.defaultIconColor}
        className="p-3 rounded-xl bg-[#0FA95810]"
      />
    );
  };

  return (
    <button
      onClick={props?.onClickHandler}
      style={{ backgroundColor }}
      className="w-[85%] lg:w-72 h-16 rounded-md bg-white flex items-center space-x-2 px-2 cursor-pointer lg:hover:scale-[1.03] hover:drop-shadow-xl transition-all ease-in-out duration-200"
    >
      {renderIcon()}
      <div className="space-y-1">
        <h4 className={`font-inter text-sm text-start ${textColor}`}>
          View My Dashboard
        </h4>
      </div>
    </button>
  );
};
