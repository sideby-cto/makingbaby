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
  data.forEach((practice: any) => {
    const exists = store.has(practice._id);
    if (!exists) {
      store.set(practice._id, practice);
    }
  });
  return Array.from(store.values());
};

export const useFilterModalPractices = (
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

    const selectedSchool = ( filter?.dataSource === "insights" ) ? filter?.insightsSchool : filter?.school;
    let dataOptions = [];

    if (selectedSchool?.key && selectedSchool?.key !== "All") {
      const schoolGoalData = selectedSchool?.value?.schoolGoals;
      const schoolPractices = schoolGoalData?.flatMap(
        (gl: any) => gl.promisingPractices
      );
      dataOptions = mapUniqueItems(schoolPractices);
    } else {
      let allPromisingPractices: any[] = [];
      if (districtSchools.length) {
        allPromisingPractices = districtSchools.flatMap((sch) =>
          sch.schoolGoals.flatMap((gl) => gl.promisingPractices)
        );
      } else {
        allPromisingPractices = Object.values(
          userDashboardData.schoolGoals
        ).flatMap((sch: any) =>
          sch.flatMap((gl: any) => gl.promisingPractices)
        );
      }
      dataOptions = mapUniqueItems(allPromisingPractices);
    }

    const dataOptionsAsLabelValueFormat = convertListToLabelValue(
      dataOptions,
      "name",
      "_id",
      "this"
    ) as LabelValueRef[];
  
    sortAlphabetically(dataOptionsAsLabelValueFormat);
  
    const dataOptionsAsLabelValueFormatWithAllPractices = [
      { label: "All Promising Practices", value: "All" },
      ...dataOptionsAsLabelValueFormat,
    ];
    return dataOptionsAsLabelValueFormatWithAllPractices;
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
