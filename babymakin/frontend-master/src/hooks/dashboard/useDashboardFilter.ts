import { useReducer } from "react";
import { FilterAction, IDashboardFilterState } from "./interface";

const InitialState: IDashboardFilterState = {
  filterBy: undefined,
  school: undefined,
  district: undefined,
  team: undefined,
  user: undefined,
  goal: undefined,
  successSign: undefined,
  characteristic: undefined,
  promisingPractice: undefined,
  dataSource: "all-data",
  storyType: "Success",
  timePeriod: {
    fromMonth: "",
    fromYear: "",
    toMonth: "",
    toYear: "",
  },
  insightsSchool: undefined,
  insightsGoal: undefined,
  insightsTimePeriod: {
    fromMonth: "",
    fromYear: "",
    toMonth: "",
    toYear: "",
  },
};

const FilterReducer = (
  state: IDashboardFilterState,
  { type, payload }: FilterAction
): IDashboardFilterState => {
  switch (type) {
    case "setDistrict":
      return { ...state, district: payload };
    case "setSchool":
      return { ...state, school: payload };
     case "setTeam":
      return { ...state, team: payload };
    case "setUser":
      return { ...state, user: payload };
    case "setGoal":
      return { ...state, goal: payload };
    case "setStoryType":
      return { ...state, storyType: payload };
    case "setPractice":
      return {
        ...state,
        promisingPractice: payload,
      };
    case "setSuccessSign":
      return { ...state, successSign: payload };
    case "setCharacteristic":
      return {
        ...state,
        characteristic: payload,
      };
    case "setTimePeriod":
      return { ...state, timePeriod: payload };
    case "setFilterBy":
      return { ...state, filterBy: payload };
    case "setDataSource":
      return { ...state, dataSource: payload };
    case "setState":
      return {
        ...state,
        ...payload,
      };
      case "setInsightsSchool":
        return { ...state, insightsSchool: payload };
      case "setInsightsGoal":
        return { ...state, insightsGoal: payload };
      case "setInsightsTimePeriod":
        return { ...state, insightsTimePeriod: payload };
    default:
      return state;
  }
};

export const useDashboardFilter = () => {
  const [state, dispatch] = useReducer(FilterReducer, InitialState);

  const setCharacteristics = (payload: any) => {
    dispatch({ type: "setCharacteristic", payload });
  };
  const setDistrict = (payload: any) => {
    dispatch({ type: "setDistrict", payload });
  };
  const setUser = (payload: any) => {
    dispatch({ type: "setUser", payload });
  };
  const setGoal = (payload: any) => {
    dispatch({ type: "setGoal", payload });
  };
  const setPractice = (payload: any) => {
    dispatch({ type: "setPractice", payload });
  };
  const setSchool = (payload: any) => {
    dispatch({ type: "setSchool", payload });
  };
  const setTimePeriod = (payload: IDashboardFilterState["timePeriod"]) => {
    dispatch({ type: "setTimePeriod", payload });
  };
  const setSign = (payload: any) => {
    dispatch({ type: "setSuccessSign", payload });
  };
  const setTeam = (payload: IDashboardFilterState["team"]) => {
    dispatch({ type: "setTeam", payload });
  };
  const setState = (payload: Partial<IDashboardFilterState>) => {
    dispatch({ type: "setState", payload });
  };
  const setDataSource = (payload: IDashboardFilterState["dataSource"]) => {
    dispatch({ type: "setDataSource", payload });
  };
  const setStoryType = (payload: IDashboardFilterState["storyType"]) => {
    dispatch({ type: "setStoryType", payload });
  };
  const setFilterBy = (payload: IDashboardFilterState["filterBy"]) => {
    dispatch({ type: "setFilterBy", payload });
  };
  const setInsightsSchool = (payload: any) => {
    dispatch({ type: "setInsightsSchool", payload });
  };
  const setInsightsGoal = (payload: any) => {
    dispatch({ type: "setInsightsGoal", payload });
  };
  const setInsightsTimePeriod = (payload: IDashboardFilterState["insightsTimePeriod"]) => {
    dispatch({ type: "setInsightsTimePeriod", payload });
  };


  
  return {
    filter: state,
    updateFilter: dispatch,
    reducer: FilterReducer,
    actions: {
      setCharacteristics,
      setDistrict,
      setUser,
      setGoal,
      setPractice,
      setSchool,
      setTimePeriod,
      setSign,
      setTeam,
      setState,
      setDataSource,
      setStoryType,
      setFilterBy,
      setInsightsSchool,
      setInsightsGoal,
      setInsightsTimePeriod
    },
  };
};
