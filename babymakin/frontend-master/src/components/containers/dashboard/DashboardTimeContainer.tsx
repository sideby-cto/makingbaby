import React from "react";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { COLORS } from "src/design-system";
import { useGlobalDashboardFilter } from "../../../contexts/dashboardFilter.selector";

const { iconBackgroundColor, iconColor } = COLORS.getStarted;

export const DashboardTimeContainer: React.FC = () => {
  const filter = useGlobalDashboardFilter()!;
  const fromTimeString = filter?.dataSource === "insights" ? `${filter?.insightsTimePeriod.fromMonth}, ${filter?.insightsTimePeriod.fromYear}` : `${filter?.timePeriod.fromMonth}, ${filter?.timePeriod.fromYear}`;
  const toTimeString = filter?.dataSource === "insights" ? `${filter?.insightsTimePeriod.toMonth}, ${filter?.insightsTimePeriod.toYear}` : `${filter?.timePeriod.toMonth}, ${filter?.timePeriod.toYear}`;

  //
  return (
    <div className="flex h-full gap-x-3 items-start py-3 px-0 lg:py-0 lg:px-5">
      <div
        style={{ backgroundColor: iconBackgroundColor }}
        className="p-2 rounded-lg"
      >
        <MdOutlineAccessTimeFilled style={{ color: iconColor }} />
      </div>
      <div className="flex flex-col gap-y-[2px]">
        <h2 className="text-md text-defaultText font-interMedium">
          Time Period
        </h2>
        {fromTimeString === toTimeString ? (
          <>
            <span className="text-sm text-defaultText font-interMedium">
              {fromTimeString}
            </span>
          </>
        ) : (
          <>
            <span className="block text-[10px] text-right text-defaultText font-inter">
              From:
              <span className="pl-2 text-sm text-defaultText font-interMedium">
                {fromTimeString}
              </span>
            </span>
            <span className="block text-[10px] text-right  text-defaultText font-inter">
              To:
              <span className="pl-2 text-sm text-defaultText font-interMedium">
                {toTimeString}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};
