import { useEffect, useState } from "react";
import { useLocation, Location } from "react-router-dom";
import {
  useCollections,
  useInitialDashboardData,
  useDistrictSchools,
} from "../../../utils";
import { useUserGlobalState } from "../../useUserGlobalState";
import { useGlobalDashboardState } from "../../../contexts/dashboardFilter.selector";
import { transformUserDataToFilterDataFactory } from "../../../application/dashboard/transformUserDataToFilterDataFactory";
import {
  IDashboardFilterState,
  IUpdateDashboardDataQueryPayload,
} from "../interface";
import { makeUpdateDashboardQueryPayload } from "../../../application/dashboard/transformDashboardFilterToPayload";
import { DashboardConfigType } from "../../getStarted";
import { setInitialFilterConfigurations } from "./utils";
import { GetInitialDashboardDataParams } from "../../../api";
import { EventNames, MixPanel } from "../../../utils/mixPanel";

export interface UseDashboardPageProps {}

export interface UseDashboardPageLocationProps extends Location {
  state: {
    config?: DashboardConfigType;
  };
}

export const useDashboardPage = () => {
  // Get initial filter state from Get Started page 'proceedToDashboard' function
  const { state } = useLocation() as UseDashboardPageLocationProps;
  const getStartedPageConfig = state?.config;
  const [getStartedConfig, setGetStartedConfig] = useState<any>(null);

  // Get signed-in user
  const user = useUserGlobalState()[0];
  const uid = user!;

  // Get global filter state with actions to update filter
  const {
    filter,
    reducer,
    actions: filterActions,
  } = useGlobalDashboardState()!;

  // Set initial filter configurations
  useEffect(() => {
    setInitialFilterConfigurations({
      filterActions,
      getStartedPageConfig,
      filter,
    });
  }, []);

  // Update Dashboard Query Params when filter changes
  // then useInitialDashboardData will fetch new data with the updated query params
  useEffect(() => {
   const payload = makeUpdateDashboardQueryPayload(filter, uid );
   updateDashboardFilter(payload); // set updated payload to query params
  }, [filter]);

  // Fetch all data from collections
  const { collections, collectionLoadingStates } = useCollections();
  const {
    allUsers,
    allTeams,
    allDistricts,
    allGoals,
    allSchools
  } = collections;
  // Get loading states to check if all data is loaded
  const {
    loadingUsers,
    loadingTeams,
    loadingDistricts,
    loadingGoals,
    loadingSchools,
  } = collectionLoadingStates;

  // Set state of query params to fetch dashboard data
  const [dashboardInitialQueryParams, setDashboardInitialQueryParams] =
    useState<GetInitialDashboardDataParams>({});

  // Fetch dashboard data based on query params
  const { data: initialDashboardData, isLoading: loadingInitialDashboardData } =
    useInitialDashboardData(dashboardInitialQueryParams);

  const [globalUserData, setGlobalUserData] = useState<any>();

  // Get schools of user's district
  const { schools: districtSchools } = useDistrictSchools(
    user?.district?._id ?? ""
  );

  // Modal success signs are more than dashboard graph success signs because,
  // dashboard success signs filter from  stories and if success sign do not have data, it is not sent.
  // modal success sign however are gotten from the schools they selected in the modal
  // Further filter school modal success sign by checking if sign is present in filter
  // signs and also present in school success signs to ensure equal number of signs in both modal and dashboard graph.

  // Update global Dashboard Filter then trigger the useEffect of updating query params
  // Use as 'applyDashboardFilters' in FilterPageContent or 'onClickApply' in DashboardFilter
  const applyDashboardFilters = (filter: IDashboardFilterState) => {
    filterActions.setState(filter);
  };

  const updateDashboardFilter = (
    filterPayload: IUpdateDashboardDataQueryPayload
  ) => {
    setDashboardInitialQueryParams(filterPayload);
  };

  const fetchDashboardDataWithNewDataSource = (
    source: "all-data" | "user-stories" | "insights"
  ) => {

    const updatedFilter = reducer(filter, {
      type: "setDataSource",
      payload: source,
    });
    const payload = makeUpdateDashboardQueryPayload(updatedFilter, uid );
    updateDashboardFilter(payload);
    filterActions.setDataSource(source);

  };

  const fetchSuccessSignData = (e?: any) => {
    if (e) {
      const successSign = e.payload.payload;
      if (successSign) {
        const sign = { key: successSign.id, value: successSign };

        const updatedFilter = reducer(filter, {
          type: "setSuccessSign",
          payload: sign,
        });

        MixPanel.track(EventNames.filterSelected, { filter: updatedFilter });

        const payload = makeUpdateDashboardQueryPayload(updatedFilter, uid);

        updateDashboardFilter(payload);
        filterActions.setSign(sign);
      }
    }
  };

  const fetchPromisingPractice = (e?: any) => {
    if (e) {
      const promisingPractice = e.payload.payload;
      if (promisingPractice) {
        const selectedPractice = {
          key: promisingPractice.id,
          value: promisingPractice,
        };
        const updatedFilter = reducer(filter, {
          type: "setPractice",
          payload: selectedPractice,
        });

        MixPanel.track(EventNames.filterSelected, { filter: updatedFilter });

        const refetchDashboardDataPayload = makeUpdateDashboardQueryPayload(
          updatedFilter,
          uid
        );
        updateDashboardFilter(refetchDashboardDataPayload);
        filterActions.setPractice(selectedPractice);
      }
    }
  };

  const fetchStudentCharacteristics = (e?: any) => {
    if (e) {
      const characteristic = e.payload.payload;
      if (characteristic) {
        const selectedCharacteristic = {
          key: characteristic.id,
          value: characteristic,
        };
        const updatedFilter = reducer(filter, {
          type: "setCharacteristic",
          payload: selectedCharacteristic,
        });
        MixPanel.track(EventNames.filterSelected, { filter: updatedFilter });

        const refetchDashboardDataPayload = makeUpdateDashboardQueryPayload(
          updatedFilter,
          uid
        );
        updateDashboardFilter(refetchDashboardDataPayload);
        filterActions.setCharacteristics(selectedCharacteristic);
      }
    }
  };

  useEffect(() => {
    if (getStartedPageConfig) {
      return setGetStartedConfig(getStartedPageConfig);
    }
  }, [getStartedPageConfig]);

  useEffect(() => {
    /*
      Sync Get Started filters with dashboard filters
    */
    // to upgradeThisLayerWithDefaultPromisingPractice layer
    const initialFilterData = transformUserDataToFilterDataFactory(user);
    setGlobalUserData(initialFilterData);

    const localConfig = { ...getStartedConfig };

    if (!localConfig?.promisingPractice) {
      localConfig["promisingPractice"] = {
        key: "All",
        value: "All",
      };
    }
  
    if (!localConfig?.successSign) {
      localConfig["successSign"] = {
        key: "All",
        value: "All",
      };
    }


    if (!localConfig?.characteristic) {
      localConfig["characteristic"] = {
        key: "All",
        value: "All",
      };
    }

  
    localConfig["team"] = { key: "All", value: "All" };
 
    filterActions.setState(localConfig);

    const updatedFilter = reducer(filter, {
      type: "setState",
      payload: localConfig,
    });

    const fetchDashboardDataPayload = makeUpdateDashboardQueryPayload(
      updatedFilter,
      uid
    );
    updateDashboardFilter(fetchDashboardDataPayload);
  }, [getStartedConfig, user]);

  // Combine all data-fetching loading states into one indicator
  const allDataLoaded = !loadingInitialDashboardData 
                        && !loadingUsers 
                        && !loadingTeams 
                        && !loadingDistricts 
                        && !loadingGoals 
                        && !loadingSchools;

  return {
    filter,
    allDistricts,
    allSchools,
    districtSchools,
    allUsers,
    allGoals,
    allTeams,
    applyDashboardFilters,
    fetchSuccessSignData,
    fetchDashboardDataWithNewDataSource,
    fetchPromisingPractice,
    fetchStudentCharacteristics,
    globalUserData,
    dashboardData: initialDashboardData,
    loadingDashboardData: loadingInitialDashboardData,
    allDataLoaded,
  };
};
