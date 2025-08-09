import { FC, useState } from "react";
import { UseDashboardPageProps } from "src/hooks";
import {
  AdminCustomStoryContainer,
  AdminDashboardGraphContainer,
  Loading,
} from "src/components";
import { RunningTallyComponent } from "src/components/containers/dashboard";
import { EmptyData } from "src/components";
import { ViewStoryDetailsModal, ViewStoryModalWrapper } from "src/components";
import { StoryType } from "src/utils/types";
import { useDashboardStories } from "src/hooks/dashboard/useDashboardStories";
import { useUniqueAuthors } from "src/hooks/dashboard/useUniqueAuthors";
import { useDashboardSigns } from "src/hooks/dashboard/useDashboardSigns";
import { useDashboardPractices } from "src/hooks/dashboard/useDashboardPractices";
import { useDashboardCharacteristics } from "src/hooks/dashboard/useDashboardCharacteristics";
import { DashboardFilter } from "src/components/containers/dashboard/dashboard-filter/DashboardFilter";
import { IDashboardFilterState } from "src/hooks/dashboard/interface";

interface FilterPageContentProps extends UseDashboardPageProps {
  filter: IDashboardFilterState;
  allDistricts: any;
  allSchools: any;
  districtSchools: any;
  allUsers: any;
  allGoals: any;
  allTeams: any;
  fetchSuccessSignData: (e: any) => void;
  applyDashboardFilters: (filter: IDashboardFilterState) => void;
  loadingDashboardData: boolean;
  fetchPromisingPractice: (e: any) => void;
  fetchStudentCharacteristics: (e: any) => void;
  globalUserData: any;
  dashboardData: any;
}

export const FilterPageContent: FC<FilterPageContentProps> = ({
  filter,
  allDistricts,
  allSchools,
  districtSchools,
  allUsers,
  allGoals,
  allTeams,
  fetchSuccessSignData,
  applyDashboardFilters,
  loadingDashboardData,
  fetchPromisingPractice,
  fetchStudentCharacteristics,
  globalUserData,
  dashboardData,
}) => {
  const stories = useDashboardStories(dashboardData);
  const signs = useDashboardSigns(dashboardData, filter);
  const practices = useDashboardPractices(dashboardData, filter);
  const characteristics = useDashboardCharacteristics(dashboardData, filter);
  const uniqueAuthors = useUniqueAuthors( stories );

  const dataSourceLabel =
    filter.goal?.value === "All" || !filter.goal?.value?.name
      ? "All Goals"
      : filter.goal?.value?.name;

  const [storyToView, setStoryToView] = useState<StoryType | null>(null);

  return (
    <div className="w-full h-full px-3 lg:px-10 overflow-y-auto overflow-x-hidden">
      <div className="relative flex flex-col lg:flex-row w-full justify-between items-start lg:items-center pt-8">
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
      <div className="flex flex-col w-full h-fit mt-10 pb-10 lg-graph:flex-row justify-between space-x-0 gap-y-12 lg-graph:space-x-6 lg-graph:space-y-0">
          <AdminDashboardGraphContainer
          title="Promising Practices"
          data={practices}
          fetchSubGraphs={fetchPromisingPractice}
          loading={loadingDashboardData}
          chartsContainerClassName="absolute top-0 flex ml-0 lg-graph:ml-[0%] w-full h-[350px]"
        />
        <AdminDashboardGraphContainer
          title="Success Signs"
          data={signs}
          fetchSubGraphs={fetchSuccessSignData}
          loading={loadingDashboardData}
          chartsContainerClassName="absolute top-0 flex ml-0 lg-graph:ml-[0%] w-full h-[350px]"
        />
        <AdminDashboardGraphContainer
          title="Characteristics"
          data={characteristics}
          fetchSubGraphs={fetchStudentCharacteristics}
          loading={loadingDashboardData}
          chartsContainerClassName="absolute top-0 flex ml-0 lg-graph:ml-[0%] w-full h-[350px]"
        />
      </div>
      
      <div className="w-full drop-shadow-xl bg-white rounded-md">
        <div className="flex w-full bg-white py-5 px-3 sticky top-0 z-40">
          <h1 className="font-interBold text-defaultText text-xl">
            Small Win Stories
          </h1>
        </div>
        <div className="flex-1 flex-col h-full w-full overflow-y-auto space-y-5">
          {loadingDashboardData ? (
            <Loading />
          ) : (
            <>
              {stories.length === 0 ? (
                <EmptyData title="stories" />
              ) : (
                <>
                  {stories.map((story: StoryType, idx: any) => (
                    <AdminCustomStoryContainer
                      onClick={() => setStoryToView(story)}
                      key={idx}
                      data={story}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {storyToView && (
        <ViewStoryModalWrapper
          isOpen={!!storyToView}
          toggleModal={() => setStoryToView(null)}
        >
          <ViewStoryDetailsModal
            onClose={() => setStoryToView(null)}
            story={storyToView}
          />
        </ViewStoryModalWrapper>
      )}
    </div>
  );
};
