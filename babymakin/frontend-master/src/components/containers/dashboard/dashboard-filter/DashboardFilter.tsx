import React, { useState, useEffect } from "react";
import { getMonthNames, getYearOptions } from "../../../../utils";
import {
  DistrictType,
  SchoolType,
  TeamType,
  UserType,
} from "../../../../utils/types";
import { useGlobalDashboardFilter } from "../../../../contexts/dashboardFilter.selector";
import { useUserPermissionSummary } from "../../../../hooks/dashboard/useUserPermissionSummary";
import { useDashboardFilter } from "../../../../hooks";
import { IDashboardFilterState } from "../../../../hooks/dashboard/interface";
import { useFilterModalTeams } from "../../../../hooks/dashboard/useFilterModalTeams";
import { useFilterModalTeamLevelData } from "../../../../hooks/dashboard/useFilterModalTeamData";
import { useFilterModalUsers } from "../../../../hooks/dashboard/useFilterModalUsers";
import { useFilterModalSigns } from "../../../../hooks/dashboard/useFilterModalSigns";
import { useFilterModalCharacteristics } from "../../../../hooks/dashboard/useFilterModalCharacteristics";
import { useFilterModalPractices } from "../../../../hooks/dashboard/useFilterModalPractices";
import { useFilterModalStoryTypeOptions } from "../../../../hooks/dashboard/useFilterModalStoryTypeOptions";
import { useFilterModalGoals } from "../../../../hooks/dashboard/useFilterModalGoals";
import { GoalType } from "../../../../core";
import { generateRandomColor } from "../../../../application/dashboard/generateRandomColor";
import { DesktopDashboardFilter } from "./DesktopDashboardFilter";
import { getDashboardFilterOptions } from "./getDashboardFilterOptions";
import { MobileDashboardFilter } from "./MobileDashboardFilter";
import { EventNames, MixPanel } from "../../../../utils/mixPanel";

const defaultFilter = { key: "All", value: "All" };

interface DashboardFilterProps {
  adminDistricts: DistrictType[];
  adminSchools: SchoolType[];
  districtSchools: SchoolType[];
  allUsers: UserType[];
  adminGoals: GoalType[];
  teams: TeamType[];
  dashboardData: any;
  globalUserData?: any;
  onClickApply?: (filter: IDashboardFilterState) => void;
  onClickCancel?: (e?: any) => void;
}

export const DashboardFilter: React.FC<DashboardFilterProps> = ({
  adminDistricts: allDistricts,
  adminSchools: allSchools,
  districtSchools,
  allUsers,
  adminGoals: allGoals,
  teams,
  onClickApply,
  onClickCancel,
  globalUserData,
}) => {
  const { filter, actions: filterStateActions } = useDashboardFilter();
  const globalDashboardFilters = useGlobalDashboardFilter();
  const [filterUpdateCount, setFilterUpdateCount] = useState(0);

  const {
    isAdmin,
    isDistrictLeader,
    isSchoolLeaderOrStaff,
    isOrganizationLeader,
  } = useUserPermissionSummary();

  // set indicator for data source
  // -> only show 'person' filter in 'all-data' page
  const isAtAllDataPage = filter?.dataSource === "all-data";
  // -> show both SW and LL for the Insights Page, based on the following
  const isInsightsPage = filter?.dataSource === "insights";

  // filter team options using all or selected school(s)
  // teamOptions.label = team.name, teamOptions.value = team._id
  const { options: teamOptions, hash: teamOptionsHash } = useFilterModalTeams(
    filter,
    globalUserData,
    teams,
    allSchools,
    districtSchools
  );

  // filter person options using all or selected team(s)
  // personOptions.label = person.name, personOptions.value = person.id
  const { options: personOptions, hash: personOptionsHash } =
    useFilterModalUsers(
      filter,
      globalUserData,
      allUsers,
      allSchools,
      districtSchools
    );

  const { hash: practiceOptionsHash, options: practiceOptions } =
    useFilterModalPractices(globalUserData, filter, districtSchools, allSchools);

  const { options: signOptions, hash: signOptionsHash } =
    useFilterModalSigns(globalUserData, filter, districtSchools, allSchools);
  
  const { options: characteristicOptions, hash: characteristicOptionsHash } =
    useFilterModalCharacteristics(globalUserData, filter, districtSchools, allSchools);

  const {
    districts: districtOptions,
    schools: schoolOptions,
    districtOptionsHash,
    schoolOptionsHash,
  } = useFilterModalTeamLevelData({
    adminSchools: allSchools,
    districtSchools,
    districts: allDistricts,
    filter,
  });

  const { hash: goalOptionsHash, options: goalOptions } = useFilterModalGoals(
    filter,
    allGoals,
    districtSchools,
    allSchools
  );

  const storyTypeOptions = useFilterModalStoryTypeOptions();

  // Time period filter
  const months = getMonthNames();
  const years = getYearOptions();

  const selectTimePeriod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterUpdateCount((current) => current + 1);
    const { name, value } = e.target;
    const payload = {
      fromMonth:
        name === "fromMonth"
          ? value
          : filter.dataSource === "insights"
          ? filter.insightsTimePeriod.fromMonth
          : filter.timePeriod.fromMonth,
      fromYear:
        name === "fromYear"
          ? value
          : filter.dataSource === "insights"
          ? filter.insightsTimePeriod.fromYear
          : filter.timePeriod.fromYear,
      toMonth:
        name === "toMonth"
          ? value
          : filter.dataSource === "insights"
          ? filter.insightsTimePeriod.toMonth
          : filter.timePeriod.toMonth,
      toYear:
        name === "toYear"
          ? value
          : filter.dataSource === "insights"
          ? filter.insightsTimePeriod.toYear
          : filter.timePeriod.toYear,
    };

    if (filter.dataSource === "insights") {
      filterStateActions.setInsightsTimePeriod(payload);
    } else {
      filterStateActions.setTimePeriod(payload);
    }
  };

  // Filter data by selected filter
  const onClickApplyHandler = () => {
    MixPanel.track(EventNames.filterSelected, { filter });
    onClickApply?.(filter);
  };

  const handleOnChangeDistrict = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const districtKey = e.target.value;
    const district = districtOptionsHash[e.target.value];
    filterStateActions.setDistrict({
      key: districtKey,
      value: district,
    });
    // Check if selected school is in selected district
    if (districtKey && filter?.school?.value?.district?._id !== districtKey) {
      filterStateActions.setSchool(defaultFilter);
    }
    filterStateActions.setFilterBy("District");
  };

  const handleOnChangeSchool = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const schoolKey = e.target.value;
    if (schoolKey !== "All") {
      const school = schoolOptionsHash[e.target.value];
      if (filter.dataSource === "insights") {
        filterStateActions.setInsightsSchool({
          key: schoolKey,
          value: school,
        });
      } else {
        filterStateActions.setSchool({
          key: schoolKey,
          value: school,
        });
      }
    } else {
      if (filter.dataSource === "insights") {
        filterStateActions.setInsightsSchool(defaultFilter);
      } else {
        filterStateActions.setSchool(defaultFilter);
      }
    }
    filterStateActions.setTeam(defaultFilter);
    filterStateActions.setUser(defaultFilter);

    if (filter.dataSource === "insights") {
      filterStateActions.setInsightsGoal(defaultFilter);
    } else {
      filterStateActions.setGoal(defaultFilter);
    }

    filterStateActions.setFilterBy("School");
  };

  const handleOnChangeTeam = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const teamKey = e.target.value;
    if (teamKey !== "All") {
      const team = teamOptionsHash[e.target.value];
      filterStateActions.setTeam({
        key: teamKey,
        value: team,
      });
      // assign school based on selected team if school is not selected
      if (filter.school?.key === "All") {
        const schoolOfSelectedTeam = allSchools.find(
          (school) => school?._id === team?.school?._id
        );
        filterStateActions.setSchool({
          key: schoolOfSelectedTeam?._id,
          value: schoolOfSelectedTeam,
        });
      }
    } else {
      filterStateActions.setTeam(defaultFilter);
    }
    filterStateActions.setUser(defaultFilter);
    filterStateActions.setGoal(defaultFilter);
    filterStateActions.setFilterBy("Team");
  };

  const handleOnChangePerson = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const personKey = e.target.value;
    if (personKey !== "All") {
      const person = personOptionsHash[e.target.value];
      filterStateActions.setUser({
        key: personKey,
        value: person,
      });
      filterStateActions.setFilterBy("User");
    } else {
      filterStateActions.setUser(defaultFilter);
    }
  };

  const handleOnChangeGoal = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const goalKey = e.target.value;
    if (goalKey !== "All") {
      const goal = goalOptionsHash[e.target.value];
      if (filter.dataSource === "insights") {
        filterStateActions.setInsightsGoal({
          key: goalKey,
          value: goal,
        });
      } else {
        filterStateActions.setGoal({
          key: goalKey,
          value: goal,
        });
        filterStateActions.setSign(defaultFilter);
      }
    } else {
      if (filter.dataSource === "insights") {
        filterStateActions.setInsightsGoal(defaultFilter);
      } else {
        filterStateActions.setGoal(defaultFilter);
        filterStateActions.setSign(defaultFilter);
      }
    }
  };

  const handleOnChangeStoryType = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    filterStateActions.setStoryType(e.target.value);
  };

  const handleOnChangePractice = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const practiceKey = e.target.value;
    if (practiceKey !== "All") {
      const practice = practiceOptionsHash[e.target.value];
      if (!practice?.color) {
        practice.color = generateRandomColor();
      }
      filterStateActions.setPractice({
        key: practiceKey,
        value: { ...practice, value: 1 },
      });
    } else {
      filterStateActions.setPractice(defaultFilter);
    }
  };

  const handleOnChangeSign = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const signKey = e.target.value;
    if (signKey !== "All") {
      let sign = signOptionsHash[e.target.value];
      if (!sign?.color) {
        sign.color = generateRandomColor();
      }
      filterStateActions.setSign({
        key: signKey,
        value: { ...sign, value: 1 },
      });
    } else {
      filterStateActions.setSign(defaultFilter);
    }
  };

  const handleOnChangeCharacteristic = (e: any) => {
    setFilterUpdateCount((current) => current + 1);
    const characteristicKey = e.target.value;
    if (characteristicKey !== "All") {
      const characteristic = characteristicOptionsHash[e.target.value];
      if (!characteristic?.color) {
        characteristic.color = generateRandomColor();
      }
      filterStateActions.setCharacteristics({
        key: characteristicKey,
        value: { ...characteristic, value: 1 },
      });
    } else {
      filterStateActions.setCharacteristics(defaultFilter);
    }
  };

  // Set initial filter state from globalDashboardFilters
  useEffect(() => {
    filterStateActions.setState(globalDashboardFilters!);
  }, [globalDashboardFilters]);

  // Trigger onClickApplyHandler with each filter update count
  useEffect(() => {
    if (filterUpdateCount > 0) {
      onClickApplyHandler();
    }
  }, [filterUpdateCount]);

  const options = getDashboardFilterOptions({
    isOrganizationLeader,
    isAdmin,
    isDistrictLeader,
    isSchoolLeaderOrStaff,
    isAtAllDataPage,
    isInsightsPage,
    districtOptions,
    handleOnChangeDistrict,
    filter,
    schoolOptions,
    handleOnChangeSchool,
    teamOptions,
    handleOnChangeTeam,
    personOptions,
    handleOnChangePerson,
    goalOptions,
    handleOnChangeGoal,
    storyTypeOptions,
    handleOnChangeStoryType,
    filterStateActions,
    signOptions,
    handleOnChangeSign,
    practiceOptions,
    handleOnChangePractice,
    characteristicOptions,
    handleOnChangeCharacteristic,
    months,
    years,
    selectTimePeriod,
    onClickApplyHandler,
  });

  return (
    <>
      <DesktopDashboardFilter
        options={options}
        // Apply Button removed due to auto update with each filter change
      />
      <MobileDashboardFilter
        options={options}
        onClickApplyHandler={onClickApplyHandler}
      />
    </>
  );
};
