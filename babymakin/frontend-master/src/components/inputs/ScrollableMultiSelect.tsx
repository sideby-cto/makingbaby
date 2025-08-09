import React from "react";
import { BsCheck } from "react-icons/bs";

interface ScrollableMultiSelectProps {
  title: string;
  options: any[];
  values: any[];
  onSelectHandler: (data: any) => void;
  selectedKey: string;
}

export const ScrollableMultiSelect: React.FC<ScrollableMultiSelectProps> = ({
  title,
  options,
  values,
  onSelectHandler,
  selectedKey,
}) => (
  <div className="w-full lg:w-[30%] h-40 rounded-md mt-4">
    <div className="flex flex-col w-full h-full bg-gray-100 rounded-md px-2 py-3 space-y-3 overflow-hidden">
      <p className="text-black font-interMedium text-sm">{title}</p>
      <div className="flex-1 flex flex-col overflow-y-scroll px-2">
        {options.map((sign, idx) => {
          const selected = values.some((itm) => itm === sign[selectedKey]);
          return (
            <p
              key={idx}
              onClick={onSelectHandler.bind(this, sign._id)}
              className="flex  text-sm font-inter px-2 py-2 hover:bg-slate-200 cursor-pointer transition-all ease-in-out duration-500 "
            >
              {selected && <BsCheck color="#0096FF" size="18px" />}
              {sign.name}
            </p>
          );
        })}
      </div>
    </div>
  </div>
);
