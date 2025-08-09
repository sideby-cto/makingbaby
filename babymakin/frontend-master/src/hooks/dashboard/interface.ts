export type FilterByType = "School" | "District" | "Team" | "User" | undefined;

export type DashboardDataSource = "all-data" | "user-stories" | "insights";

export type DashboardStoryType = "Success" | "Lesson Learned";

export type FilterActions =
  | "setSchool"
  | "setDistrict"
  | "setTeam"
  | "setUser"
  | "setGoal"
  | "setSuccessSign"
  | "setCharacteristic"
  | "setPractice"
  | "setTimePeriod"
  | "setDataSource"
  | "setStoryType"
  | "setFilterBy"
  | "setState"
  | "setInsightsSchool"
  | "setInsightsGoal"
  | "setInsightsTimePeriod";

export interface FilterAction {
  type: FilterActions;
  payload?: any;
}

export interface FilterObjectType {
  key: string;
  value?: any;
}

export type IDashboardFilterState = {
  filterBy: FilterByType | undefined;

  district: FilterObjectType | undefined;
  team: FilterObjectType | undefined;
  user: FilterObjectType | undefined;
  successSign: FilterObjectType | undefined;
  characteristic: FilterObjectType | undefined;
  promisingPractice: FilterObjectType | undefined;
  dataSource: DashboardDataSource;
  storyType: DashboardStoryType;
  school: FilterObjectType | undefined;
  goal: FilterObjectType | undefined;
  timePeriod: {
    fromMonth: string;
    fromYear: string;
    toMonth: string;
    toYear: string;
  };

  // independent properties for the Insights Dashboard
  insightsSchool: FilterObjectType | undefined;
  insightsGoal: FilterObjectType | undefined;
  insightsTimePeriod:  {
    fromMonth: string;
    fromYear: string;
    toMonth: string;
    toYear: string;
  };
};

export interface IUpdateDashboardDataQueryPayload {
  district: string;
  school: string;
  team: string;
  user: string;
  goal: string;
  successSign: string;
  promisingPractices: string;
  studentCharacteristics: string;
  storyType: "SW" | "LL";
  fromDate: Date;
  toDate: Date;
  userId: string;

  insights: boolean;
  insightsSchool: string;
  insightsGoal: string;
  insightsFromDate: Date;
  insightsToDate: Date;
}

export type ReducerType<State, Action extends FilterAction> = (
  state: State,
  { type, payload }: Action
) => State;
