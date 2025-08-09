import React from "react";
import { FaCity } from "react-icons/fa";
import { TbSchool } from "react-icons/tb";

interface GetStartedSelectDistrictOrSchoolProps {
  type: "school" | "district";
  data: any;
  onClickHandler?: (e?: any) => void;
  showDescription?: boolean;
  selectedValue: any;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  iconProps?: {
    activeColor?: string;
    inactiveColor?: string;
  };
}

export const GetStartedSelectDistrictOrSchool: React.FC<
  GetStartedSelectDistrictOrSchoolProps
> = (props) => {
  const { data, type, selectedValue } = props;

  const isSchool = type === "school";
  const isSelected =
    data &&
    selectedValue &&
    (typeof data === "string"
      ? data === selectedValue
      : data._id === selectedValue._id);
  const name = typeof data === "string" ? data : data.name;

  /**@Style */
  const containerSize = isSchool ? "w-fit h-12" : "w-fit h-16";
  const backgroundColor = isSelected
    ? props?.activeBackgroundColor ?? "#2493a2"
    : props?.inactiveBackgroundColor ?? "#00000040";
  const color = isSelected
    ? props?.activeTextColor ?? "#fff"
    : props?.inactiveTextColor ?? "#000";
  const iconColor = isSelected
    ? props?.iconProps?.activeColor ?? "#fff"
    : props?.iconProps?.inactiveColor ?? "#000";

  /**
   *
   * @ViewRenderFns
   *
   */
  const renderIcon = () => {
    const props = {
      color: iconColor,
      size: "16px",
    };
    return isSchool ? <TbSchool {...props} /> : <FaCity {...props} />;
  };

  return (
    <div
      style={{
        backgroundColor,
        color,
      }}
      onClick={props?.onClickHandler?.bind(this, data)}
      className={`flex justify-center px-5 items-center space-x-3 ${containerSize} rounded-full border-[1px] ${
        isSelected ? "border-[#008080]" : "border-none"
      } cursor-pointer hover:scale-[1.03] hover:drop-shadow-xl transition ease-in-out duration-200`}
    >
      {renderIcon()}
      <div className={`text-md font-interMedium `}>{name}</div>
    </div>
  );
};
