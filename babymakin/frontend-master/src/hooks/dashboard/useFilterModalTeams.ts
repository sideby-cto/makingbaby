import { useMemo } from "react";
import { IDashboardFilterState } from "./interface";
import { useUserPermissionSummary } from "./useUserPermissionSummary";
import { useUserGlobalState } from "../useUserGlobalState";
import { TeamType } from "../../utils/types";
import { SchoolType } from "../../core";
import { convertListToLabelValue } from "../../utils/functions/helper/convertListToLabelValue";
import { convertArrayToHashMap } from "../../utils/functions/helper/convertArrayToHashTable";

const sortAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.label.localeCompare(a.label));
};

const makeTeamListFromAllTeams = (
  schools: SchoolType[],
  teams: TeamType[]
) => {
  // Extracting the IDs of the schools
  const schoolIds = schools.map((sch) => sch._id);

  // Filtering teams based on whether their school ID exists in schoolIds array
  const teamList = teams.filter((tm) =>
    schoolIds.includes(tm?.school?._id)
  );
  return teamList;
};

export const useFilterModalTeams = (
  filter: IDashboardFilterState,
  userDashboardData: any,
  adminTeams: any[],
  adminSchools: SchoolType[],
  districtSchools: SchoolType[]
) => {
  const permissions = useUserPermissionSummary();
  const user = useUserGlobalState()[0];
  const data = useMemo(() => {
    if (!user) return [];
    const { isAdmin, isDistrictLeader, isOrganizationLeader } = permissions;
    
    let dataOptions: any[] = [];
    const districtSelectedAndNotAll = filter?.district && filter?.district?.key !== '' && filter?.district?.value !== undefined;
    const schoolSelectedAndNotAll = (filter.dataSource === "insights") ? filter.insightsSchool?.key && filter.insightsSchool?.key !== "All" : filter.school?.key && filter.school?.key !== "All";

    if (schoolSelectedAndNotAll) {
      // Filter teams that belong to the selected school
      const selectedSchool = (filter.dataSource === "insights") ? filter.insightsSchool : filter?.school;
      const selectedSchoolTeams = adminTeams?.filter(
        (team: TeamType) => selectedSchool?.key.startsWith('scid_')
          ? selectedSchool.value.schools.includes(team?.school?._id)
          : team?.school?._id === selectedSchool?.key
      );
      dataOptions = selectedSchoolTeams;
    } else if (districtSelectedAndNotAll && (isAdmin || isOrganizationLeader)) {
      // Filter teams that belong to the selected district
      const selectedDistrict = filter?.district;
      const schoolsInDistrict = adminSchools.filter((school) => school?.district?._id === selectedDistrict?.key);
      const schoolInDistrictIds = schoolsInDistrict.map((school) => school._id);
      const teamsInDistrict = adminTeams.filter((team) => schoolInDistrictIds?.includes(team?.school?._id));
      dataOptions = teamsInDistrict;
    } else if (isAdmin) {
      dataOptions = adminTeams;
    } else {
      const teamList = makeTeamListFromAllTeams(
        isDistrictLeader ? districtSchools : user.schools ?? [],
        adminTeams ?? []
      );
      dataOptions = teamList;
    }

    const dataOptionsAsLabelValueFormat = convertListToLabelValue(
      dataOptions,
      "name",
      "_id",
      "this"
    ) as LabelValueRef[];
    sortAlphabetically(dataOptionsAsLabelValueFormat);

    const dataOptionsAsLabelValueFormatWithAllTeams = [
      { label: "All Teams", value: "All" },
      ...dataOptionsAsLabelValueFormat,
    ];
    return dataOptionsAsLabelValueFormatWithAllTeams;
  }, [
    permissions,
    filter,
    adminTeams,
    userDashboardData,
    user,
    districtSchools,
  ]);

  const hash = useMemo(() => {
    return convertArrayToHashMap(
      data,
      (option: LabelValueRef) => option.value,
      (option: any) => option.ref
    );
  }, [data]);

  return { options: data, hash };
};
