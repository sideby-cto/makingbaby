export type GlobalDashboardDataFilterType = {
  school?: string;
  district?: any;
  goal?: string;
  team?: string;
  fromDate?: Date;
  toDate?: Date;
  successSign?: string;
  promisingPractice?: string;
  characteristic?: string;
  userId?: string;
  storyType?: "Success" | "Lesson Learned";
};

export interface ModalFilterType {
  goal: string | undefined;
  filterBy: FilterByType;
  successSign: string | undefined;
  promisingPractice: string | undefined;
  characteristic: string | undefined;
  team: string | undefined;
  district: string | undefined;
  school: string | undefined;
  storyType: "Success" | "Lesson Learned";
  timePeriod: {
    fromMonth: string | undefined;
    fromYear: string | undefined;
    toMonth: string | undefined;
    toYear: string | undefined;
  };
}

export type DashboardModalFilterActions =
  | "select-goal"
  | "select-success_sign"
  | "select-promising_practice"
  | "select-characteristic"
  | "select-characteristic"
  | "select-time_period"
  | "select-team"
  | "select-district"
  | "select-school"
  | "select-story_type"
  | "sync-daashboard-filters";

export interface FilterAction {
  type: DashboardModalFilterActions;
  payload?: any;
}

export type FilterByType = "School" | "District" | "Team" | undefined;
