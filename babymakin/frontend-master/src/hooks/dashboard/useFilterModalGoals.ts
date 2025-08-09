import { useMemo } from "react";
import { useUserGlobalState } from "../useUserGlobalState";
import { IDashboardFilterState } from "./interface";
import { useUserPermissionSummary } from "./useUserPermissionSummary";
import { GoalType, SchoolType } from "../../core";
import { convertListToLabelValue } from "../../utils/functions/helper/convertListToLabelValue";
import { convertArrayToHashMap } from "../../utils/functions/helper/convertArrayToHashTable";

const sortAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.label.localeCompare(a.label));
};

const makeSchoolGoalsFromSchools = (schools: SchoolType[]) => {
  const goals = schools.flatMap((sch) => (
    sch.schoolGoals.flatMap((gl) => ({
      ...gl.goal,
      successSigns: gl.successSigns,
      studentCharacteristics: gl.studentCharacteristics,
      promisingPractices: gl.promisingPractices
    }))
  ));
  return goals;
};

const uniqueItems = (data: any) => {
  if (!data) return [];
  const store = new Map();
  data.forEach((gl: any) => {
    const exists = store.has(gl._id);
    if (!exists) {
      store.set(gl._id, gl);
    }
  });
  return Array.from(store.values());
};

export const useFilterModalGoals = (
  filter: IDashboardFilterState,
  adminGoals: GoalType[],
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

    
    const selectedSchool = (filter?.dataSource === "insights" ) ? filter?.insightsSchool : filter?.school;
    let dataOptions: any[] = [];

    if (selectedSchool?.key && selectedSchool?.key !== "All") {
      dataOptions = makeSchoolGoalsFromSchools([selectedSchool.value]);
    } else if (isAdmin && !districtSchools.length) {
      dataOptions = adminGoals;
    } else {
      const schools = districtSchools.length ? districtSchools : user?.schools;
      const schoolGoals = makeSchoolGoalsFromSchools(schools ?? []);
      dataOptions = uniqueItems(schoolGoals);
    }

    const dataOptionsAsLabelValueFormat = convertListToLabelValue(
      dataOptions,
      "name",
      "_id",
      "this"
    ) as LabelValueRef[];

    sortAlphabetically(dataOptionsAsLabelValueFormat);

    const dataOptionsAsLabelValueFormatWithAllGoals = [
      { label: "All Goals", value: "All" },
      ...dataOptionsAsLabelValueFormat,
    ];
    return dataOptionsAsLabelValueFormatWithAllGoals;
  }, [user, filter, permissions, adminGoals, districtSchools]);

  const hash = useMemo(() => {
    return convertArrayToHashMap(
      data,
      (option: LabelValueRef) => option.value,
      (option: any) => option.ref
    );
  }, [data]);

  return { options: data, hash };
};
