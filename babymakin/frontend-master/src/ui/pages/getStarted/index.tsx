import React from "react";
import { ProIcons } from "../../../assets/icons";
import {
  DashboardSelectGoalCard,
  GetStartedSelectDistrictOrSchool,
  GetStartedViewDataCard,
  Loading,
  RoundedButton,
  EmptyData,
} from "src/components";
import { COLORS } from "src/design-system";
import { DistrictType, SchoolType } from "../../../core";
import { useGetStartedPage } from "../../../hooks";
import { RenderCondition, RenderIf } from "../../lib";
import { AiOutlineComment } from "react-icons/ai";
import { GetStartedCallToAction } from "src/ui/pages/getStarted/components";

export const GetStartedPage: React.FC = () => {
  const {
    selectCategory,
    setGoalsByCategory,
    updateConfig,
    proceedToDashboard,
    categoryOptions,
    user,
    categoryGoals,
    dashboardConfig,
    isDistrictLevel,
    selectingGoal,
    loadingCategoryOptions,
    onClickCreateNewStory,
  } = useGetStartedPage();

  const { filterBy: selectedCategory } = dashboardConfig;
  const {
    defaultText,
    activeOvalBackgroundColor,
    inactiveOvalBackgroundColor,
    categoryBackgroundColor,
    iconBackgroundColor,
    iconColor,
  } = COLORS.getStarted;

  const renderCategoryData = () => {
    if (selectedCategory === "School" && Array.isArray(categoryOptions)) {
      return (
        <>
          {isDistrictLevel && (
            <GetStartedSelectDistrictOrSchool
              onClickHandler={() => {
                updateConfig({
                  type: "select-school",
                  payload: "All Schools in District",
                });
                setGoalsByCategory("All Schools in District");
              }}
              data="All Schools in District"
              type="school"
              inactiveBackgroundColor={inactiveOvalBackgroundColor}
              selectedValue={dashboardConfig.school.value}
              activeBackgroundColor={activeOvalBackgroundColor}
              activeTextColor="#fff"
              inactiveTextColor={defaultText}
              iconProps={{ inactiveColor: iconColor }}
            />
          )}
          {(categoryOptions as SchoolType[]).map((sch, idx) => (
            <GetStartedSelectDistrictOrSchool
              onClickHandler={() => {
                updateConfig({ type: "select-school", payload: sch });
                setGoalsByCategory(sch);
              }}
              data={sch}
              type="school"
              key={idx}
              inactiveBackgroundColor={inactiveOvalBackgroundColor}
              selectedValue={dashboardConfig?.school?.value}
              activeBackgroundColor={activeOvalBackgroundColor}
              activeTextColor="#fff"
              inactiveTextColor={defaultText}
              iconProps={{ inactiveColor: iconColor }}
            />
          ))}
        </>
      );
    } else if (
      selectedCategory === "District" &&
      Array.isArray(categoryOptions)
    ) {
      return (categoryOptions as DistrictType[]).map((dist, idx) => (
        <GetStartedSelectDistrictOrSchool
          onClickHandler={() => {
            updateConfig({ type: "select-district", payload: dist });
            setGoalsByCategory(dist);
          }}
          data={dist}
          type="district"
          key={idx}
          selectedValue={dashboardConfig.district.value}
        />
      ));
    } else return;
  };

  const renderCategoryGoals = () => {
    return categoryGoals.map((goal, idx) => (
      <DashboardSelectGoalCard
        key={idx}
        title={goal.goal.name}
        selectGoalHandler={proceedToDashboard.bind(proceedToDashboard, goal)}
        style={{ backgroundColor: categoryBackgroundColor, color: defaultText }}
        iconProps={{ color: "#fff" }}
      />
    ));
  };

  return (
    <div className="h-full bg-[#00000020] flex justify-center items-center">
      <div className="flex flex-col container h-[90%] w-[95%] mx-auto p-3 overflow-y-auto bg-white rounded-md">
        <div className="flex w-full h-fit px-4 py-3 mb-4 border-b-[1px] border-[#c9c9c9]/20">
          <h1 className="font-interMedium text-defaultText text-md">
            Getting Started
          </h1>
        </div>
        <div className="flex flex-col w-full h-full pt-2 lg:pt-5 px-2 lg:px-10">
          <div className="flex w-full items-center lg:items-start space-x-2">
            <h2 className="text-defaultText text-lg lg:text-3xl font-interBold">
              Welcome to your Dashboard!
            </h2>
            <img src={ProIcons.ProWelcome} alt="" className="h-10 lg:h-8" />
          </div>
          <div className="flex flex-col w-full h-fit pt-3">
            <div className="flex flex-col lg:flex-row h-fit space-x-0 gap-y-0 lg:gap-y-0 lg:space-x-6">
              <GetStartedCallToAction
                onClick={onClickCreateNewStory}
                isSelected={false}
                icon={
                  <AiOutlineComment
                    style={{ backgroundColor: iconBackgroundColor }}
                    color={iconColor}
                    size="2.7rem"
                    className={`p-3 rounded-xl`}
                  />
                }
              >
                Create a Small Win Story
              </GetStartedCallToAction>

              {RenderCondition(
                user?.permissionLevel === "Admin" ||
                  user?.permissionLevel === "Organization Leader",
                <>
                  <GetStartedViewDataCard
                    type="school"
                    onClickHandler={() => selectCategory("School")}
                    selected={selectedCategory === "School"}
                    iconProps={{
                      inactiveTintColor: iconBackgroundColor,
                      inactiveColor: iconColor,
                      defaultIconColor: iconColor,
                    }}
                  />
                  <GetStartedViewDataCard
                    type="district"
                    onClickHandler={() => selectCategory("District")}
                    selected={selectedCategory === "District"}
                    iconProps={{
                      inactiveTintColor: iconBackgroundColor,
                      inactiveColor: iconColor,
                      defaultIconColor: iconColor,
                    }}
                  />
                </>,
                <GetStartedViewDataCard
                  type="school"
                  onClickHandler={() => selectCategory("School")}
                  selected={selectedCategory === "School"}
                  iconProps={{
                    inactiveTintColor: iconBackgroundColor,
                    inactiveColor: iconColor,
                    defaultIconColor: iconColor,
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col w-full pt-10 pb-4">
            <h4 className="text-sm text-defaultText font-interBold">
              {selectedCategory ? `Select a  ${selectedCategory}` : null}
            </h4>
            <div className="flex flex-wrap w-full mt-4 gap-5 p-3 mb-2 transition-all ease-in-out duration-1000 ">
              {loadingCategoryOptions ? (
                <Loading containerClassName="flex w-full items-center justify-center py-3" />
              ) : (
                renderCategoryData()
              )}
            </div>
          </div>
          {RenderIf(
            (selectedCategory === "District" && dashboardConfig.district.key) ||
              (selectedCategory === "School" && dashboardConfig.school.key),
            <div className="flex flex-col w-full my-2 mt-4 my-4 py-4">
              <h4 className="text-sm text-defaultText font-interBold">
                Select a goal
              </h4>

              <div className="flex flex-wrap w-full pt-4 gap-5 p-3 mb-4 transition-all ease-in-out duration-1000">
                {selectingGoal ? (
                  <Loading containerClassName="flex w-full items-center justify-center py-3" />
                ) : !selectingGoal &&
                  categoryGoals &&
                  categoryGoals.length > 0 ? (
                  <>
                    <DashboardSelectGoalCard
                      title="All Goals"
                      style={{
                        backgroundColor: categoryBackgroundColor,
                        color: defaultText,
                      }}
                      iconProps={{ color: "#fff" }}
                      selectGoalHandler={proceedToDashboard}
                    />
                    {renderCategoryGoals()}
                  </>
                ) : (
                  <EmptyData
                    title={
                      selectedCategory === "District"
                        ? "district goals"
                        : "school goals"
                    }
                  />
                )}
              </div>
              {RenderIf(
                !selectingGoal,
                <div className="flex w-full justify-center items-center">
                  <RoundedButton
                    onClick={proceedToDashboard.bind(
                      proceedToDashboard,
                      "All Goals"
                    )}
                    title="Proceed to dashboard"
                    containerStyle="bg-[#2493A2] w-52 px-6 py-3 mt-4 text-white font-interMedium text-sm rounded-full justify-center items-center"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
