import React from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { ConfigurationNamesType } from "../../utils/types";

interface ConfigurationTableRowProps {
  data: unknown;
  onDeleteClick: () => void;
  onRowClick: () => void;
  rowType?: "small" | "wide";
  parent?: ConfigurationNamesType;
}

export const ConfigurationTableRow: React.FC<ConfigurationTableRowProps> = ({
  data,
  onDeleteClick,
  onRowClick,
  rowType,
  parent,
}) => {
  const textStyle = "text-[13px] font-inter";

  const renderRowData = () => {
    if (rowType === "small") {
      const { name } = data as any;
      return (
        <>
          <div className="w-2 h-2 mr-3 rounded-full bg-black"></div>
          <div className={`w-4/5 ${textStyle}`}>{name}</div>
          <div className="w-1/5 flex justify-end">
            <AiOutlineDelete
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick();
              }}
              className="text-[#D61C4E] hover:text-red- hover:bg-[#000]/10 rounded-full transition-all duration-200 cursor-pointer hover:scale-110 transform p-1 "
              size="28px"
            />
          </div>
        </>
      );
    } else {
      const { organization, district, school, name } = data as any;
      const tableRows =
        parent === "Teams" ? (
          <>
            <div className={`w-2/5 ${textStyle}`}>{name}</div>
            <div className={`w-1/5 ${textStyle}`}>{school?.name}</div>
          </>
        ) : parent === "Schools" ? (
          <>
            <div className={`w-2/5 ${textStyle}`}>{name}</div>
            <div className={`w-1/5 ${textStyle}`}>{district?.name}</div>
          </>
        ) : parent === "Districts" ? (
          <>
            <div className={`w-2/5 ${textStyle}`}>{name}</div>
            <div className={`w-1/5 ${textStyle}`}>{organization?.name}</div>
          </>
        ) : parent === "Organizations" || parent === "School Classifications" ? (
          <>
            <div className={`w-2/5 ${textStyle}`}>{name}</div>
            <div className={`w-1/5 ${textStyle}`}></div>
          </>
        ) : null;

      return (
        <>
          {tableRows}
          <div className="w-1/5">
            <span className=" flex justify-end ">
              <AiOutlineDelete
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick();
                }}
                className="text-[#D61C4E] hover:text-red- hover:bg-[#000]/10 rounded-full transition-all duration-200 cursor-pointer hover:scale-110 transform p-1 "
                size="28px"
              />
            </span>
          </div>
        </>
      );
    }
  };
  return (
    <div
      onClick={onRowClick}
      className={`flex py-2 items-center 2xl:text-lg hover:bg-slate-100 transition-all duration-200 p-3 cursor-pointer`}
    >
      {renderRowData()}
    </div>
  );
};
