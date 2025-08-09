import { useMemo } from "react";
import { IDashboardFilterState } from "./interface";
import { useUserPermissionSummary } from "./useUserPermissionSummary";
import { useUserGlobalState } from "../useUserGlobalState";
import { UserType } from "../../utils/types";
import { SchoolType } from "../../core";
import { convertListToLabelValue } from "../../utils/functions/helper/convertListToLabelValue";
import { convertArrayToHashMap } from "../../utils/functions/helper/convertArrayToHashTable";

const sortAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.label.localeCompare(a.label));
};

const uniqueItems = (users: LabelValueRef[]): LabelValueRef[] => {
  const unique = new Map<string | number, LabelValueRef>();
  users?.forEach((user) => {
    // Use option.value as the unique key to filter duplicates
    if (!unique.has(user?.value)) {
      unique.set(user?.value, user);
    }
  });
  // Convert the Map values back to an array
  return Array.from(unique.values());
};

const makeUserListFromAllUsersBySchool = (
  schools: SchoolType[],
  allUsers: UserType[]
) => {
  if (!schools) return [];
  // Extract school IDs
  var schoolIds = schools?.map((school) => school?._id);
  // Filter users based on school IDs
  let filteredUser: UserType[] = allUsers?.filter((user) =>
    user?.schools?.some((school) => schoolIds?.includes(school?._id))
  );
  return filteredUser;
};

export const useFilterModalUsers = (
  filter: IDashboardFilterState,
  userDashboardData: any,
  allUsers: UserType[],
  adminSchools: SchoolType[],
  districtSchools: SchoolType[]
) => {
  const permissions = useUserPermissionSummary();
  const user = useUserGlobalState()[0];

  const data = useMemo(() => {
    if (!user) return [];
    const { isAdmin, isDistrictLeader, isOrganizationLeader } = permissions;

    let dataOptions: any[] = [];
    const districtSelectedAndNotAll =
      filter?.district &&
      filter?.district?.key !== "" &&
      filter?.district?.value !== undefined;
    const schoolSelectedAndNotAll =
      filter.dataSource === "insights"
        ? filter.insightsSchool?.key && filter.insightsSchool?.key !== "All"
        : filter.school?.key && filter.school?.key !== "All";
    const teamSelectedAndNotAll =
      filter?.team?.key && filter?.team?.key !== "All";

    // Precedence for filtering 'person' options:
    // follow selected team if team is selected
    // -> follow school if school is selected
    // -> show all possible options if both are not selected
    if (teamSelectedAndNotAll) {
      const selectedTeam = filter?.team;
      // Extract team ID
      const teamId = selectedTeam?.key;
      const usersOfSelectedTeam = allUsers?.filter((user: UserType) =>
        user?.teams?.some((team) => team?._id === teamId)
      );
      dataOptions = usersOfSelectedTeam;
    } else if (schoolSelectedAndNotAll) {
      const selectedSchool =
        filter.dataSource === "insights"
          ? filter.insightsSchool
          : filter?.school;

      // Extract school ID
      const schoolId = selectedSchool?.key;
      const usersOfSelectedSchool = allUsers?.filter((user: UserType) =>
        user?.schools?.some((school) =>
          schoolId?.startsWith("scid_")
            ? selectedSchool?.value.schools.includes(school?._id)
            : school?._id === schoolId
        )
      );
      dataOptions = usersOfSelectedSchool;
    } else if (districtSelectedAndNotAll && (isAdmin || isOrganizationLeader)) {
      // Filter users of the selected district
      const selectedDistrict = filter?.district;
      const schoolsInDistrict = adminSchools?.filter(
        (school) => school?.district?._id === selectedDistrict?.key
      );
      const schoolInDistrictIds = new Set(
        schoolsInDistrict?.map((school) => school?._id)
      );
      const usersInDistrict = (allUsers || []).filter((user) =>
        user?.schools?.some((school) =>
          schoolInDistrictIds?.has(school?._id)
        )
      );
      dataOptions = usersInDistrict;
    } else {
      // (default) no school or team selected
      // -> only show options accessable by user
      if (isAdmin) {
        dataOptions = allUsers;
      } else if (isDistrictLeader) {
        dataOptions = districtSchools
          ? makeUserListFromAllUsersBySchool(districtSchools, allUsers)
          : [];
      } else {
        // School Leader and Staff Member
        // Show persons of the same school OR team
        let userSchools = user?.schools;
        let userTeams = user?.teams;

        // Extract IDs from schools and teams
        const schoolIds = userSchools?.map((school) => school?._id) || [];
        const teamIds = userTeams?.map((team) => team?._id) || [];

        // Filter users with the same school OR team that the sign-in user belongs
        dataOptions = allUsers?.filter(
          (user) =>
            user?.schools?.some((school) => schoolIds?.includes(school?._id)) ||
            user?.teams?.some((team) => teamIds?.includes(team?._id))
        );
      }
    }

    let dataOptionsAsLabelValueFormat = convertListToLabelValue(
      dataOptions,
      "name",
      "id",
      "this"
    ) as LabelValueRef[];

    // Remove duplicates from options
    dataOptionsAsLabelValueFormat = uniqueItems(dataOptionsAsLabelValueFormat);
    // Sort options
    sortAlphabetically(dataOptionsAsLabelValueFormat);

    const dataOptionsAsLabelValueFormatWithAllUsers = [
      { label: "All Users", value: "All" },
      ...dataOptionsAsLabelValueFormat,
    ];
    return dataOptionsAsLabelValueFormatWithAllUsers;
  }, [permissions, filter, userDashboardData, allUsers]);

  const hash = useMemo(() => {
    return convertArrayToHashMap(
      data,
      (option: LabelValueRef) => option.value,
      (option: any) => option.ref
    );
  }, [data]);

  return { options: data, hash };
};
