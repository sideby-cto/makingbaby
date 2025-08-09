import React from "react";
import { Select } from "../inputs";

interface MonthYearDateSelectorProps {
  months: string[];
  years: string[];
  yearValue: string;
  onChangeYear: (e?: any) => void;
  yearPlaceHolderText?: string;
  yearSelectorName?: string;
  monthValue: string;
  onChangeMonth: (e?: any) => void;
  monthSelectorName: string;
  monthPlaceHolderText?: string;
  label: string;
}

export const MonthYearDateSelector: React.FC<MonthYearDateSelectorProps> = ({
  months,
  onChangeMonth,
  monthValue,
  monthSelectorName,
  monthPlaceHolderText,
  years,
  onChangeYear,
  yearValue,
  yearSelectorName,
  yearPlaceHolderText,
  label,
}) => (
  <div className="flex">
    <Select
      options={(months || []).map((time) => ({
        label: time,
        value: time,
      }))}
      containerClassName="flex flex-col gap-3 w-full lg:max-w-xs mr-2"
      className="w-full rounded-[5px] p-1.5 border-[1px] bg-white border-[#0000004D] text-sm focus:outline-none"
      labelClassName="text-[#008080] text-sm font-bold"
      label={label}
      onChange={onChangeMonth}
      value={monthValue}
      name={monthSelectorName}
      placeholder={monthPlaceHolderText}
    />
    <Select
      options={(years || []).map((time) => ({
        label: time,
        value: time,
      }))}
      className="w-full rounded-[5px] p-1.5 border-[1px] bg-white border-[#0000004D] text-sm focus:outline-none"
      labelClassName="text-[#008080] text-sm font-bold invisible"
      label="nil"
      onChange={onChangeYear}
      value={yearValue ?? ""}
      name={yearSelectorName}
      placeholder={yearPlaceHolderText}
    />
  </div>
);
