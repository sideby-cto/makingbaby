import { useMemo } from "react";
import { convertListToLabelValue } from "../../utils/functions/helper/convertListToLabelValue";
import { convertArrayToHashMap } from "../../utils/functions/helper/convertArrayToHashTable";
import { SchoolType } from "../../core";
import { useUserPermissionSummary } from "./useUserPermissionSummary";
import { useUserGlobalState } from "../useUserGlobalState";

const sortAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.label.localeCompare(a.label));
};

const mapUniqueItems = (data: any) => {
  if (!data) return [];
  const store = new Map();
  data.forEach((sign: any) => {
    const exists = store.has(sign._id);
    if (!exists) {
      store.set(sign._id, sign);
    }
  });
  return Array.from(store.values());
};

export const useFilterModalSigns = (
  userDashboardData: any,
  filter: any,
  districtSchools: SchoolType[],
  allSchools: SchoolType[]
) => {
  const user = useUserGlobalState()[0];
  const permissions = useUserPermissionSummary();

  const data = useMemo(() => {
    if (!user) return [];
    const { isAdmin, isOrganizationLeader } = permissions;

    if (isAdmin || isOrganizationLeader) {
      const selectedDistrict = filter?.district;
      if (selectedDistrict?.key && selectedDistrict?.key !== "All") {
        districtSchools = allSchools.filter((school: SchoolType) =>
          school?.district?._id === selectedDistrict.key 
        );
      } else if (isOrganizationLeader) {
        districtSchools = allSchools.filter((school: SchoolType) =>
          school?.district?.organization === user?.organization?._id
        );
      }
    }

    const selectedGoal = ( filter?.dataSource === "insights" ) ? filter?.insightsGoal : filter?.goal;
    const selectedSchool = ( filter?.dataSource === "insights" ) ? filter?.insightsSchool : filter?.school;
    let dataOptions: any[] = [];

    if (selectedGoal?.key && selectedGoal?.key !== "All") {
      dataOptions = mapUniqueItems(selectedGoal.value?.successSigns);
    } else if (selectedSchool?.key && selectedSchool?.key !== "All") {
      const schoolGoalData = selectedSchool?.value?.schoolGoals;
      const schoolSigns = schoolGoalData?.flatMap(
        (gl: any) => gl.successSigns
      );
      dataOptions = mapUniqueItems(schoolSigns);
    } else {
      let allSuccessSigns: any[] = [];
      if (districtSchools.length) {
        allSuccessSigns = districtSchools.flatMap((sch) =>
          sch.schoolGoals.flatMap((gl) => gl.successSigns)
        );
      } else {
        allSuccessSigns = Object.values(
          userDashboardData.schoolGoals
        ).flatMap((sch: any) =>
          sch.flatMap((gl: any) => gl.successSigns)
        );
      }
      dataOptions = mapUniqueItems(allSuccessSigns);
    }

    let dataOptionsAsLabelValueFormat = convertListToLabelValue(
      dataOptions,
      "name",
      "_id",
      "this"
    ) as LabelValueRef[];

    sortAlphabetically(dataOptionsAsLabelValueFormat);

    const dataOptionsAsLabelValueFormatWithAllSigns = [
      { label: "All Success Signs", value: "All" },
      ...dataOptionsAsLabelValueFormat,
    ];
    return dataOptionsAsLabelValueFormatWithAllSigns;
  }, [user, permissions, userDashboardData, filter, districtSchools, allSchools]);

  const hash = useMemo(() => {
    return convertArrayToHashMap(
      data,
      (option: LabelValueRef) => option.value,
      (option: any) => option.ref
    );
  }, [data]);

  return { options: data, hash };
};
