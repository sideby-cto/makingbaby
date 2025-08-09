import { FC, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { FilterPageContent } from "../../../components/containers/dashboard/FilterPageContent";
import { InsightsPageContent } from "../../../components/containers/insights/InsightsPageContent";
import { useDashboardPage } from "../../../hooks";
import { Loading } from "../../../components";
import { COLOR } from "../../../design-system";

interface DashboardPageRoutesProps {}

export const DashboardPageRoutes: FC<DashboardPageRoutesProps> = () => {
  const { pathname } = useLocation();

  const {
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
    fetchDashboardDataWithNewDataSource,
    allDataLoaded,
  } = useDashboardPage();

  // Fetch data based on path endpoint (indicating data source)
  const showOnlyUserData = pathname.includes("/my-stories");
  const showInsights = pathname.includes("/insights");
  
  useEffect(() => {
    if (showOnlyUserData) {
      fetchDashboardDataWithNewDataSource("user-stories");
    } else  if ( showInsights ) {
      fetchDashboardDataWithNewDataSource("insights");
    } else {
      fetchDashboardDataWithNewDataSource("all-data");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnlyUserData, showInsights ]);

  // Conditional rendering based on data loading state
  if (!allDataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading height={96} color={COLOR.teal} />
        <p className="text-xl font-bold text-slate-950 mt-4">Loading, please wait...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="my-stories"
        element={
          <FilterPageContent
            dashboardData={dashboardData}
            allDistricts={allDistricts}
            allSchools={allSchools}
            districtSchools={districtSchools}
            allUsers={allUsers}
            allGoals={allGoals}
            globalUserData={globalUserData}
            fetchStudentCharacteristics={fetchStudentCharacteristics}
            fetchPromisingPractice={fetchPromisingPractice}
            loadingDashboardData={loadingDashboardData}
            applyDashboardFilters={applyDashboardFilters}
            fetchSuccessSignData={fetchSuccessSignData}
            allTeams={allTeams}
            filter={filter}
          />
        }
      />
      <Route
        path="insights"
        element={
          <InsightsPageContent
            dashboardData={dashboardData}
            districtSchools={districtSchools}
            allSchools={allSchools}
            allGoals={allGoals}
            allDistricts={allDistricts}
            allUsers={allUsers}
            globalUserData={globalUserData}
            loadingDashboardData={loadingDashboardData}
            applyDashboardFilters={applyDashboardFilters}
            allTeams={allTeams}
            filter={filter}
          />
        }
      />
      <Route
        path="*"
        element={
          <FilterPageContent
            dashboardData={dashboardData}
            allDistricts={allDistricts}
            allSchools={allSchools}
            districtSchools={districtSchools}
            allUsers={allUsers}
            allGoals={allGoals}
            globalUserData={globalUserData}
            fetchStudentCharacteristics={fetchStudentCharacteristics}
            fetchPromisingPractice={fetchPromisingPractice}
            loadingDashboardData={loadingDashboardData}
            applyDashboardFilters={applyDashboardFilters}
            fetchSuccessSignData={fetchSuccessSignData}
            allTeams={allTeams}
            filter={filter}
          />
        }
      />
    </Routes>
  );
};
