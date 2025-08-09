import React from "react";
import { GiModernCity } from "react-icons/gi";
import { IoMdSchool } from "react-icons/io";
import { DashboardSubHeader } from "./DashboardSubHeader";
import { TbWindsock } from "react-icons/tb";
import { AiOutlineTeam } from "react-icons/ai";
import { DashboardTimeContainer } from "./DashboardTimeContainer";
import { COLORS } from "src/design-system";
import { IconButton } from "../../buttons";
import { BsFilter } from "react-icons/bs";
import { useGlobalDashboardFilter } from "../../../contexts/dashboardFilter.selector";
import { Condition } from "../../../ui/lib/utils/render/condition";
import { useDashboardHeaderFilterHeaders } from "../../../hooks/dashboard/useDashboardHeaderFilterTitles";

interface DashboardHeaderProps {
  onChangeDataSource?: () => void;
  onClickFilter?: () => void;
}

const { defaultTextTagColor, activeTabColor } = COLORS.navbar;
const { iconBackgroundColor, iconColor } = COLORS.getStarted;

export const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(
  (props) => {
    const filter = useGlobalDashboardFilter();
    const {
      district: districtHeading,
      goal: goalHeading,
      school: schoolHeading,
      team: teamHeading,
    } = useDashboardHeaderFilterHeaders();

    return (
      <div className="flex flex-col space-y-2 w-full">
        <div className="">
          <div className="">
            <div className="flex items-center justify-between">
              <div className="w-[70%]">
                <h3
                  style={{
                    color: activeTabColor,
                  }}
                  className="text-sm mb-1 w-full font-inter"
                >
                  Showing data for{" "}
                  {filter?.dataSource === "all-data"
                    ? "All Stories"
                    : "My Stories"}
                </h3>
                <h1 className="text-2xl w-full font-interBold text-defaultText">
                  {goalHeading}
                </h1>
              </div>
              <div className="hidden lg:flex gap-x-4 items-center">
                <button
                  className="flex w-fit px-5 h-10 items-center space-x-3 rounded-xl bg-black py-3 mt-5 lg:mt-0  font-interBold text-white text-[12px]"
                  style={{ backgroundColor: activeTabColor }}
                  onClick={props?.onChangeDataSource}
                >
                  {filter?.dataSource === "all-data"
                    ? "My Stories"
                    : "All Stories"}
                </button>
                <IconButton
                  containerStyle="flex w-fit px-5 h-10 items-center space-x-3 rounded-xl bg-black py-3 mt-5 lg:mt-0 "
                  Icon={BsFilter}
                  title="Filter"
                  style={{ backgroundColor: defaultTextTagColor }}
                  iconPosition="end"
                  textStyle="font-interBold text-white text-[12px]"
                  iconProps={{ color: "#fff", size: "20px" }}
                  onClick={props?.onClickFilter}
                />
              </div>
            </div>
            <div className="flex h-fit flex-col mt-5 lg:flex-row space-x-0 space-y-2 lg:space-x-10 lg:space-y-0">
              <Condition condition={filter?.filterBy === "District"}>
                <DashboardSubHeader
                  Icon={() => (
                    <GiModernCity
                      size="30px"
                      color={iconColor}
                      style={{ backgroundColor: iconBackgroundColor }}
                      className="p-2 rounded-lg"
                    />
                  )}
                  color=""
                  subTitle={districtHeading}
                  title="District"
                />
              </Condition>
              <Condition condition={filter?.filterBy === "School"}>
                <DashboardSubHeader
                  Icon={() => (
                    <IoMdSchool
                      size="30px"
                      color={iconColor}
                      style={{ backgroundColor: iconBackgroundColor }}
                      className={`p-2 rounded-lg`}
                    />
                  )}
                  color=""
                  subTitle={schoolHeading}
                  title="School"
                />
              </Condition>
              <Condition condition={filter?.filterBy === "Team"}>
                <DashboardSubHeader
                  Icon={() => (
                    <AiOutlineTeam
                      size="30px"
                      color={iconColor}
                      style={{ backgroundColor: iconBackgroundColor }}
                      className={`p-2 rounded-lg`}
                    />
                  )}
                  color=""
                  subTitle={teamHeading}
                  title="Team"
                />
              </Condition>

              <DashboardTimeContainer />
              <DashboardSubHeader
                Icon={() => (
                  <TbWindsock
                    size="30px"
                    color={iconColor}
                    style={{ backgroundColor: iconBackgroundColor }}
                    className={`p-2 rounded-lg`}
                  />
                )}
                color={iconColor}
                subTitle={filter?.storyType!}
                title="Small Win Story Type"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
