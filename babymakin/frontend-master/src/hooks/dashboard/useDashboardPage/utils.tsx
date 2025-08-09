import {
  DashboardConfigType,
  getInitialTimePeriodData,
} from "../../getStarted";
import { IDashboardFilterState } from "../interface";

interface SetInitialFilterConfigurationsProps {
  getStartedPageConfig: DashboardConfigType | undefined;
  filterActions: {
    setSchool: (payload: any) => void;
    setDistrict: (payload: any) => void;
    setTeam: (payload: any) => void;
    setUser: (payload: any) => void;
    setGoal: (payload: any) => void;
    setSign: (payload: any) => void;
    setCharacteristics: (payload: any) => void;
    setPractice: (payload: any) => void;
    setTimePeriod: (payload: any) => void;
    setDataSource: (payload: any) => void;
    setStoryType: (payload: any) => void;
    setFilterBy: (payload: any) => void;
    setState: (payload: any) => void;
    setInsightsSchool: (payload: any) => void;
    setInsightsGoal: (payload: any) => void;
    setInsightsTimePeriod: (payload: any) => void;
  };
  filter: IDashboardFilterState;
}

export const setInitialFilterConfigurations = ({
  filterActions,
  getStartedPageConfig,
  filter,
}: SetInitialFilterConfigurationsProps) => {
  const {
    setSchool,
    setUser,
    setTeam,
    setGoal,
    setPractice,
    setSign,
    setCharacteristics,
    setFilterBy,
    setTimePeriod,
    setInsightsSchool,
    setInsightsGoal,
    setInsightsTimePeriod,
  } = filterActions;

  if (getStartedPageConfig) {
    setSchool(filter.school);
    setGoal(filter.goal);
    setInsightsSchool(filter.insightsSchool);
    setInsightsGoal(filter.insightsGoal);
  } else {
    setSchool({ key: "All", value: "All" });
    setGoal({ key: "All", value: "All" });
    setInsightsSchool({ key: "All", value: "All" });
    setInsightsGoal({ key: "All", value: "All" });
  }
  setTeam({ key: "All", value: "All" });
  setUser({ key: "All", value: "All" });
  setPractice({ key: "All", value: "All" });
  setSign({ key: "All", value: "All" });
  setCharacteristics({ key: "All", value: "All" });
  setFilterBy("School");
  setTimePeriod(getInitialTimePeriodData());
  setInsightsTimePeriod(getInitialTimePeriodData()); 
};
