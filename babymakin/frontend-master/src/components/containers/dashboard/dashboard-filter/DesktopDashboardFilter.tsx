import { FC } from "react";
import { DashboardFilterOptionsProps } from "./dashboardUtils";
import { FormSubmitButton } from "../../../buttons";

interface DesktopDashboardFilterProps extends DashboardFilterOptionsProps {}

export const DesktopDashboardFilter: FC<DesktopDashboardFilterProps> = ({
  options,
}) => {
  const totalItemNumber = options.length;
  const half = Math.ceil((totalItemNumber) / 2);
  const firstHalf = options.slice(0, half);
  const secondHalf = options.slice(half, totalItemNumber);
  const rows = [firstHalf, secondHalf];

  return (
    <div className="hidden lg:block w-full">
      {rows.map((rowOptions, rowIndex) => (
        <div
          className={`flex items-end w-full ${rowIndex !== 0 && "pt-5"}`}
          key={rowIndex}
        >
          {rowOptions.map(({ component: filter }, idx) => (
            <div
              className={`w-full ${idx !== rowOptions.length - 1 && "pr-3"}`}
              key={idx}
            >
              {filter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
