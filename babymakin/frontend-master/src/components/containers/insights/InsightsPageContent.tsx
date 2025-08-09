import { FC } from "react";

import {
  InsightsGraphContainer,
  InsightsLeaderboardContainer,
  InsightsProgressContainer,
  InsightsMinMaxGroupContainer,
} from "src/components";

import { RunningTallyComponent } from "src/components/containers/dashboard";
import { DashboardFilter } from "src/components/containers/dashboard/dashboard-filter/DashboardFilter";

import { UseDashboardPageProps } from "src/hooks";

import { IDashboardFilterState } from "src/hooks/dashboard";
import { useDashboardStories } from "src/hooks/dashboard";
import { useFilterModalUsers } from "src/hooks/dashboard";
import { useUniqueAuthors } from "src/hooks/dashboard";

import { useLeaderboard } from "src/hooks/insights/useLeaderboard";

import { useParticipation } from "src/hooks/insights";
import { useStoriesSummary } from "src/hooks/insights";


interface InsightsPageContentProps extends UseDashboardPageProps {
  filter: IDashboardFilterState;
  allTeams: any;
  allUsers: any;
  applyDashboardFilters: (filter: IDashboardFilterState) => void;
  loadingDashboardData: boolean;
  globalUserData: any;
  allDistricts: any;
  allGoals: any;
  allSchools: any;
  districtSchools: any;
  dashboardData: any;
}

export const InsightsPageContent: FC<InsightsPageContentProps> = ({
  filter,
  allTeams,
  allUsers,
  applyDashboardFilters,
  loadingDashboardData,
  globalUserData,
  allDistricts,
  allGoals,
  allSchools,
  districtSchools,
  dashboardData,
}) => {
  const stories = useDashboardStories(dashboardData);
  const storiesSummary = useStoriesSummary( stories, filter );
  const uniqueAuthors = useUniqueAuthors( stories );
  const rankedParticipants = useLeaderboard( stories );
 
  // repurpose the useFilterModalUsers to get the correct set of potential users for calculating participation, based on filter settings.
  const { options: personOptions } = useFilterModalUsers(
    filter,
    globalUserData,
    allUsers,
    allSchools,
    districtSchools,
  );

  const participationPercent = useParticipation( stories, personOptions);

  const dataSourceLabel =
    filter.insightsGoal?.value === "All" || !filter.insightsGoal?.value?.name
      ? "All Goals"
      : filter.insightsGoal?.value?.name;


  return (
    <div className="w-full h-full px-3 lg:px-10 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col w-full h-fit mt-10 pb-10 lg-graph:flex-row justify-between space-x-0 gap-y-12 lg-graph:space-x-6 lg-graph:space-y-0">
        <DashboardFilter
          dashboardData={dashboardData}
          adminDistricts={allDistricts}
          adminSchools={allSchools}
          districtSchools={districtSchools}
          allUsers={allUsers}
          adminGoals={allGoals}
          globalUserData={globalUserData}
          teams={allTeams}
          onClickApply={applyDashboardFilters}   
        />
      </div>
      <h1 className="flex font-interBold text-defaultText text-xl mt-10">
        {dataSourceLabel}
      </h1>
      <RunningTallyComponent visible={true} stories={stories} uniqueAuthors={uniqueAuthors}/>
      <div className="object-contain flex flex-col w-full h-fit mt-10 pb-10  justify-between space-x-0 gap-y-12 ">
        <InsightsGraphContainer
          title="Stories Per Week"
          data={storiesSummary}
          loading={loadingDashboardData}
          chartsContainerClassName="absolute top-0 flex ml-0  w-full h-[350px]"
        />
      </div>
      <div className="flex flex-col w-full  h-fit mt-10 pb-10 lg-graph:flex-row justify-between space-x-0 gap-y-12 lg-graph:space-x-6 lg-graph:space-y-0">
        <InsightsLeaderboardContainer
          title="Top Contributors"
          data={rankedParticipants}
          loading={loadingDashboardData}
          leaderboardContainerClassName="top-[15%] flex ml-0 lg-graph:ml-[0%] w-fit"
        />
        <InsightsProgressContainer
          title="Participation"
          progressPercent={participationPercent}
          loading={loadingDashboardData}
          progressContainerClassName="top-[15%] flex flex-col ml-[10%] lg-graph:ml-[5%] w-[80%]  h-200px mx-[10%]"
        />
      </div>
      <div className="flex flex-col w-full h-fit mt-10 pb-10  lg-graph:flex-row justify-between gap-y-8 space-x-6 lg-graph:space-y-0">
        <InsightsMinMaxGroupContainer
          title="Patterns in Success Stories"
          data={dashboardData}
          stories={stories}
          showMinGraphs={true}
          isLessonsLearned={false}
          loading={loadingDashboardData}
        />
      </div>
      <div className="flex flex-col w-full h-fit mt-10 pb-10  lg-graph:flex-row justify-between gap-y-8 space-x-6 lg-graph:space-y-0">
        <InsightsMinMaxGroupContainer
          title="Patterns in Lessons Learned Stories"
          data={dashboardData}
          stories={stories}
          showMinGraphs={false}
          isLessonsLearned={true}
          loading={loadingDashboardData}
       />
      </div>
    </div>
  );
};