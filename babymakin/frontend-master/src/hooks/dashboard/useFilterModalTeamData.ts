import { useMemo } from "react";
import { useUserPermissionSummary } from "./useUserPermissionSummary";
import { SchoolType } from "../../core";
import { useUserGlobalState } from "../useUserGlobalState";
import { convertListToLabelValue } from "../../utils/functions/helper/convertListToLabelValue";
import { convertArrayToHashMap } from "../../utils/functions/helper/convertArrayToHashTable";
import { DistrictType } from "src/utils/types";

const sortAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.label.localeCompare(a.label));
};

const mapUniqueGoals = (data: any) => {
  if (!data) return [];
  const store = new Map();
  data.forEach((schoolGoal: any) => {
    const exists = store.has(schoolGoal.goal._id);
    if (!exists) {
      store.set(schoolGoal.goal._id, schoolGoal);
    } else {
      store
        .get(schoolGoal.goal._id)
        .promisingPractices.push(...schoolGoal.promisingPractices);
      store
        .get(schoolGoal.goal._id)
        .successSigns.push(...schoolGoal.successSigns);
      store
        .get(schoolGoal.goal._id)
        .studentCharacteristics.push(...schoolGoal.studentCharacteristics);
    }
  });
  if (!store) return [];
  return Array.from(store.values());
};

interface useFilterModalTeamLevelDataProps {
  adminSchools: SchoolType[];
  districtSchools: SchoolType[];
  districts: DistrictType[];
  filter: any;
}

export const useFilterModalTeamLevelData = ({
  adminSchools,
  districtSchools,
  districts,
  filter,
}: useFilterModalTeamLevelDataProps) => {
  const user = useUserGlobalState()[0];
  const permissions = useUserPermissionSummary();
  const organizationId = user?.organization?._id;

  const districtsForOrganizationLeader = districts
    .filter((district) => district.hasOwnProperty("organization"))
    .filter((district) => district.organization?._id === organizationId);

  // Filter districts based on user permissions
  const filterDistricts = useMemo(() => {
    let dataOptions: DistrictType[] = [];
    const { isAdmin, isDistrictLeader, isOrganizationLeader } = permissions;
    if (isAdmin) {
      dataOptions = districts;
    } else if (isDistrictLeader) {
      dataOptions = user?.district != null ? [user?.district] : [];
    } else if (isOrganizationLeader) {
      dataOptions = districtsForOrganizationLeader;
    }
    const dataOptionsAsLabelValueFormat = convertListToLabelValue(
      dataOptions,
      "name",
      "_id",
      "this"
    ) as LabelValueRef[];
    return dataOptionsAsLabelValueFormat;
  }, [permissions, user, districts]);

  const districtOptionsHash = useMemo(() => {
    return convertArrayToHashMap(
      filterDistricts,
      (option: LabelValueRef) => option.value,
      (option: any) => option.ref
    );
  }, [filterDistricts]);

  // Filter schools based on user permissions
  const filterModalSchools = useMemo(() => {
    const {
      isAdmin,
      isDistrictLeader,
      isSchoolLeaderOrStaff,
      isOrganizationLeader,
    } = permissions;
    let dataOptions: SchoolType[] = [];

    if (isAdmin) {
      const selectedDistrict = filter.district?.key;
      if (selectedDistrict) {
        const schoolsFromSelectedDistrict = adminSchools.filter(
          (school: SchoolType) => school.district?._id === selectedDistrict
        );
        dataOptions = schoolsFromSelectedDistrict;
      } else {
        dataOptions = adminSchools;
      }
    } else if (isDistrictLeader && districtSchools) {
      dataOptions = districtSchools ?? [];
    } else if (isSchoolLeaderOrStaff && Array.isArray(user?.schools)) {
      dataOptions = user?.schools ?? [];
    } else if (isOrganizationLeader) {
      const districtIds = districtsForOrganizationLeader.map(
        (district) => district._id
      );
      dataOptions = adminSchools.filter((school) =>
        districtIds.includes(school.district._id)
      );
      const selectedDistrict = filter.district?.key;

      if (selectedDistrict) {
        const schoolsFromSelectedDistrict = adminSchools.filter(
          (school: SchoolType) => school.district?._id === selectedDistrict
        );
        dataOptions = schoolsFromSelectedDistrict;
      }
    }
    // Tally school classifications from dataOptions. If more than one school of the same
    // classification exists, then add that classification to the dataOptions list.
    let classificationTallies: { [key: string]: any } = {};
    dataOptions.forEach((school) => {
      const classification = school.schoolClassification;
      if (classification) {
        if (!classificationTallies[classification._id]) {
          classificationTallies[classification._id] = {
            _id: "scid_" + classification._id,
            name: "All " + classification.name + " Schools",
            schoolGoals: [],
            schools: [],
            count: 0,
          };
        }
        classificationTallies[classification._id].count++;
        classificationTallies[classification._id].schoolGoals.push(
          ...school.schoolGoals
        );
        classificationTallies[classification._id].schools.push(school._id);
      }
    });
    const schoolClassificationsToShow = Object.values(
      classificationTallies
    ).filter((classification: any) => classification.count > 1);
    schoolClassificationsToShow.forEach((classification: any) => {
      classification.schoolGoals = mapUniqueGoals(classification.schoolGoals);
    });
    dataOptions = [...dataOptions, ...schoolClassificationsToShow];
    const dataOptionsAsLabelValueFormat = convertListToLabelValue(
      dataOptions,
      "name",
      "_id",
      "this"
    ) as LabelValueRef[];
    sortAlphabetically(dataOptionsAsLabelValueFormat);
    const dataOptionsAsLabelValueFormatWithAllSchools = [
      {
        label: isSchoolLeaderOrStaff
          ? "All Schools"
          : "All Schools in District",
        value: "All",
      },
      ...dataOptionsAsLabelValueFormat,
    ];
    return dataOptionsAsLabelValueFormatWithAllSchools;
  }, [user, adminSchools, districtSchools, filter, permissions]);

  const schoolOptionsHash = useMemo(() => {
    return convertArrayToHashMap(
      filterModalSchools,
      (option: LabelValueRef) => option.value,
      (option: any) => option.ref
    );
  }, [filterModalSchools]);

  return {
    districts: filterDistricts,
    schools: filterModalSchools,
    districtOptionsHash,
    schoolOptionsHash,
  };
};
