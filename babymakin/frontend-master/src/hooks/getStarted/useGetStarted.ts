import { useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetDataForGetStartedPage,
  useDistrictSchools,
  useSelector,
} from "../../utils";
import { DistrictType, SchoolType } from "../../utils/types";
import { useUserGlobalState } from "../useUserGlobalState";

export interface DashboardConfigType {
  filterBy: "School" | "District" | undefined;
  district?: any | undefined;
  school?: any | undefined;
  team?: any | undefined;
  goal?: any | undefined;
  successSign?: any | undefined;
  promisingPractice?: any | undefined;
  studentCharacteristic?: any | undefined;
  timePeriod?: {
    fromMonth: string;
    fromYear: string;
    toMonth: string;
    toYear: string;
  };
}

export const getInitialTimePeriodData = () => {
  const date = new Date();

  return {
    fromMonth: "August",
    fromYear:
      date.getMonth() < 7
        ? (date.getFullYear() - 1).toString()
        : date.getFullYear().toString(),
    toMonth: "July",
    toYear:
      date.getMonth() < 7
        ? date.getFullYear().toString()
        : (date.getFullYear() + 1).toString(),
  };
};

const DashboardFilterInitFunction = (): DashboardConfigType => ({
  filterBy: undefined,
  district: { key: undefined, value: undefined },
  school: { key: undefined, value: undefined },
  goal: { key: undefined, value: undefined },
  timePeriod: getInitialTimePeriodData(),
});

type DashboardActions =
  | "select-category"
  | "select-school"
  | "select-district"
  | "select-goal"
  | "init";
interface DashboardActionType {
  type: DashboardActions;
  payload?: any;
}

const DashboardConfigReducer = (
  state: DashboardConfigType,
  { type, payload }: DashboardActionType
): DashboardConfigType => {
  switch (type) {
    case "select-category":
      return { ...state, filterBy: payload };
    case "select-district":
      return {
        ...state,
        filterBy: "District",
        district: { key: payload?._id, value: payload },
        school: { key: undefined, value: undefined },
      };
    case "select-school":
      return {
        ...state,
        school: {
          key:
            payload?._id ??
            (payload === "All Schools in District"
              ? "All Schools in District"
              : undefined),
          value: payload,
        },
        filterBy: "School",
        district: { key: payload.district?._id, value: payload },
      };
    case "select-goal":
      let goal =
        payload === "All Goals"
          ? { key: "All", value: "All" }
          : { key: payload?.goal?._id, value: payload };
      return { ...state, goal: goal };
    case "init":
      return { ...payload };
    default:
      return state;
  }
};

const sortGoalsAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.goal.name.localeCompare(a.goal.name));
};

const sortSchoolsAlphabetically = (data: any) => {
  data.sort((a: any, b: any) => -1 * b.name.localeCompare(a.name));
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

const getClassificationsToAddToSchoolList = (data: SchoolType[]) => {
  let classificationTallies: { [key: string]: any } = {};
  data.forEach((school) => {
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
  return schoolClassificationsToShow;
};

export function useGetStartedPage() {
  const navigate = useNavigate();
  const [dashboardConfig, updateConfig] = useReducer(
    DashboardConfigReducer,
    null,
    DashboardFilterInitFunction
  );
  const user = useUserGlobalState()[0];
  const [categoryGoals, setCategoryGoals] = useState<any[]>([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<
    any | null
  >(null);
  const [categoryOptions, setCategoryData] = useState<any[]>([]);
  const { selectorFunction: setSchoolOptions, value: schoolOptions } =
    useSelector<any[]>([]);
  const { selectorFunction: setDistrictOptions, value: districtOptions } =
    useSelector<any[]>([]);
  const { collections, collectionLoadingStates } =
    useGetDataForGetStartedPage();
  const {
    schools: districtSchools,
    isFetchingDistrictSchools: loadingDistrictSchools,
  } = useDistrictSchools(user?.district?._id ?? "");

  const { allDistricts, allSchools } = collections;
  const [selectingGoal, setSelectingGoal] = useState(false);

  const isDistrictLevel = user?.permissionLevel === "District Leader";

  const userHasSchools = useMemo(() => {
    return schoolOptions && schoolOptions.length > 0;
  }, [schoolOptions]);

  const loadingCategoryOptions = useMemo(() => {
    const { filterBy: selectedCategory } = dashboardConfig;
    const { permissionLevel } = user ?? {};
    if (
      permissionLevel === "Admin" ||
      permissionLevel === "Organization Leader"
    ) {
      return selectedCategory === "District" || selectedCategory === "School"
        ? loadingDistrictSchools
        : false;
    } else {
      if (
        permissionLevel === "District Leader" &&
        selectedCategory === "School" &&
        loadingDistrictSchools
      )
        return true;
    }
    return false;
  }, [user, dashboardConfig, loadingDistrictSchools]);

  /**
   *
   * @Handlers
   *
   *  */
  const selectCategory = (payload: DashboardConfigType["filterBy"]) => {
    updateConfig({ type: "select-category", payload });
  };

  // navigate to dashboard with the selected config
  const proceedToDashboard = (goal: "All Goals" | any) => {
    const defaultFilter = { key: "All", value: "All" };

    // Use reducer to update 'goal' in config
    const config = DashboardConfigReducer(dashboardConfig, {
      type: "select-goal",
      payload: goal,
    });

    // Set school to default if it is not selected
    if (config.school.key === "All Schools in District") {
      config.school = defaultFilter;
    }

    navigate("/dashboard", { state: { config } });
  };

  const selectGoalHandler = async (data: any[]) => {
    setSelectingGoal(true);
    await (function () {
      setTimeout(() => {
        setSelectingGoal(false);
        setCategoryGoals(data);
      }, 500);
    })();
  };

  const setGoalsByCategory = (
    data: DistrictType | SchoolType | "All Schools in District" | null
  ) => {
    if (!data) return;
    const { filterBy: selectedCategory } = dashboardConfig;
    if (selectedCategory) {
      const selectedDistrict = selectedCategory === "District";
      const selectedSchool = selectedCategory === "School";

      if (selectedDistrict) {
        const district = data as DistrictType;
        // setSelectedCategoryOption(data);
        sortGoalsAlphabetically(district.districtGoals);
        selectGoalHandler(district.districtGoals);
      } else if (selectedSchool) {
        if (data === "All Schools in District") {
          if (user?.district && user?.district?.districtGoals) {
            sortGoalsAlphabetically(user.district!.districtGoals);
            selectGoalHandler(user.district!.districtGoals);
          }
          return;
        }
        const school = data as any;
        // setSelectedCategoryOption(data);
        sortGoalsAlphabetically(school.schoolGoals);
        selectGoalHandler(school.schoolGoals);
      }
    }
  };

  const onClickCreateNewStory = () => {
    // navigate to create story options.
    // add a logic in the dashboard to check if there is no config, set the user config to a default config
    // save a default config to local storage to allow the dashboard to pick it up
    const configAfterSelectingSchool = DashboardConfigReducer(dashboardConfig, {
      type: "select-school",
      payload: schoolOptions?.[0],
    });
    const configAfterSelectingDefaultGoal = DashboardConfigReducer(
      configAfterSelectingSchool,
      {
        type: "select-goal",
        payload: "All Goals",
      }
    );
    navigate("/create-story");
  };

  /**
   *
   * *@Effects
   *  */
  useEffect(() => {
    /**
     * Effect handler to set the school options for the various users
     */

    if (user) {
      const { permissionLevel } = user;
      let schoolList: SchoolType[] = [];
      let districtList: DistrictType[] = [];
      if (
        permissionLevel === "School Leader" ||
        permissionLevel === "Staff Member"
      ) {
        if (user?.schools) {
          schoolList = user?.schools;
        }
      } else if (permissionLevel === "District Leader") {
        if (districtSchools) {
          schoolList = districtSchools;
        }
      } else if (permissionLevel === "Organization Leader") {
        schoolList = user?.schools ?? [];
        if (allDistricts) {
          districtList = (allDistricts as DistrictType[]).filter(
            (district) => district.organization?._id === user.organization?._id
          );
        }
      } else if (permissionLevel === "Admin") {
        if (allSchools) {
          schoolList = allSchools;
        }
        if (allDistricts) {
          districtList = allDistricts;
        }
      }
      if (schoolList.length) {
        let schoolClassifications =
          getClassificationsToAddToSchoolList(schoolList);
        schoolList = [...schoolList, ...schoolClassifications];
        sortSchoolsAlphabetically(schoolList);
        setSchoolOptions(schoolList);
      }
      if (districtList.length) {
        sortSchoolsAlphabetically(districtList);
        setDistrictOptions(districtList);
      }
    }
  }, [user, districtSchools, allSchools, allDistricts]);

  useEffect(() => {
    const { filterBy: selectedCategory } = dashboardConfig;
    setSelectedCategoryOption(null);
    if (selectedCategory === "School") {
      setCategoryData(schoolOptions ?? []);
    } else if (selectedCategory === "District") {
      setCategoryData(districtOptions ?? []);
    }
  }, [dashboardConfig, schoolOptions, districtOptions]);

  return {
    selectingGoal,
    isDistrictLevel,
    loadingCategoryOptions,
    selectCategory,
    setGoalsByCategory,
    updateConfig,
    DashboardConfigReducer,
    proceedToDashboard,
    categoryOptions,
    user,
    selectedCategoryOption,
    categoryGoals,
    dashboardConfig,
    onClickCreateNewStory,
    userHasSchools,
  };
}
