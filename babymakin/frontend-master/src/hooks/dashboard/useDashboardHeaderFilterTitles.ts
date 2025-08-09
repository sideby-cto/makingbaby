import { useMemo } from "react";
import { useGlobalDashboardFilter } from "../../contexts/dashboardFilter.selector";

export const useDashboardHeaderFilterHeaders = () => {
  const filter = useGlobalDashboardFilter();

  const goal = useMemo(() => {
    const selectedGoal =
      filter?.dataSource === "insights" ? filter?.insightsGoal : filter?.goal;
    if (selectedGoal?.key && selectedGoal?.key !== "All")
      return selectedGoal?.value.name;
    return "All Goals";
  }, [filter]);
  const school = useMemo(() => {
    const selectedSchool =
      filter?.dataSource === "insights"
        ? filter?.insightsSchool
        : filter?.school;
    if (selectedSchool?.key && selectedSchool?.key !== "All")
      return selectedSchool?.value.name;
    return "All Schools in District";
  }, [filter]);

  const district = useMemo(() => {
    const selectedDistrict = filter?.district;
    if (selectedDistrict?.key && selectedDistrict?.key !== "All")
      return selectedDistrict?.value.name;
    return;
  }, [filter]);

  const team = useMemo(() => {
    const selectedTeam = filter?.team;
    if (selectedTeam?.key && selectedTeam?.key !== "All")
      return selectedTeam?.value.name;
    return;
  }, [filter]);

  return {
    goal,
    school,
    district,
    team,
  };
};
