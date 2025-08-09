import { KeyValueStateType } from "./components.types";

export type UserStatusType =
  | "Admin"
  | "Organization Leader"
  | "District Leader"
  | "School Leader"
  | "Staff Member";

export type UserType = {
  id: string;
  name: string;
  permissionLevel: UserStatusType;
  email: string;
  organization?: OrganizationType;
  district?: DistrictType;
  schools?: Array<SchoolType>;
  createdAt: Date;
  teams?: Array<TeamType>;
  mainTeam?: TeamType;
};

export type DashboardDataType = {
  successSigns: unknown[];
};

export type ConfigurationModalContentType =
  | ""
  | "create-or-edit-goal"
  | "create-or-edit-success-sign"
  | "create-or-edit-promise-practice"
  | "create-student-characteristic"
  | "delete-config-table-row"
  | "delete-config-table-row-success"
  | "create-or-edit-team"
  | "create-or-edit-school"
  | "create-or-edit-school-classification"
  | "create-or-edit-district"
  | "create-or-edit-organization"
  | "create-or-edit-user"
  | "delete-user"
  | "delete-user-success";

export type UsersModalContentType =
  | ""
  | "create-or-edit-user"
  | "delete-user"
  | "delete-user-success";

/**TSD [Team, District] to add type to shorter Rows */
type IndexRowData<T> = T extends "TSD"
  ? {
      name: string;
    }
  : {
      title: string;
      createdDate: Date;
      schoolName: string;
      district: string;
    };

export type RowType<T> = IndexRowData<T>;

/**@Bank */
export type GoalType = {
  _id: string;
  name: string;
  isDistrictLevel: boolean;
};
export type PromisingPracticeType = {
  _id: string;
  name: string;
  createdAt: Date;
};
export type SuccessSignType = PromisingPracticeType;
export type StudentCharacteristicType = PromisingPracticeType;

// data create types
export type CreateGoalType = {
  name: string;
  isDistrictLevel: boolean;
};

export type CreatePromisingPracticeType = {
  name: string;
};
export type CreateSuccessSignType = CreatePromisingPracticeType;
export type CreateStudentCharacteristicType = CreatePromisingPracticeType;

/**@Teams */
export type OrganizationType = {
  _id: string;
  createdAt: Date;
  name: string;
};

export type DistrictType = {
  _id: string;
  createdAt: Date;
  name: string;
  districtGoals: TeamGoalType[];
  organization?: OrganizationType;
};

export type SchoolType = {
  _id: string;
  createdAt: Date;
  name: string;
  schoolGoals: TeamGoalType[];
  district: DistrictType;
  schoolClassification?: SchoolClassificationType;
};

export type SchoolClassificationType = {
  _id: string;
  createdAt: Date;
  name: string;
};

export type TeamType = {
  _id: string;
  createdAt: Date;
  name: string;
  teamGoals: GoalType[];
  school: SchoolType;
};

export type CreateOrganizationType = {
  name: string;
};

export type CreateDistrictType = {
  name: string;
  districtGoals: {
    promisingPractices: string[];
    successSigns: string[];
    studentCharacteristics: string[];
  }[];
  organization: string;
};

export type CreateSchoolType = {
  name: string;
  schoolGoals: {
    promisingPractices: string[];
    successSigns: string[];
    studentCharacteristics: string[];
  }[];
  district: string;
  schoolClassification: string;
};

export type CreateSchoolClassificationType = {
  name: string;
};

export type CreateTeamType = {
  name: string;
  teamGoals: {
    promisingPractices: string[];
    successSigns: string[];
    studentCharacteristics: string[];
  }[];
  school: string;
};

export type IndexModalContextType<T> = T extends "create-or-edit-goal"
  ? GoalType
  : T extends "create-or-edit-success-sign"
  ? SuccessSignType
  : T extends "create-or-edit-promise-practice"
  ? PromisingPracticeType
  : T extends "create-or-edit-team"
  ? TeamType
  : T extends "create-or-edit-school"
  ? SchoolType
  : T extends "create-or-edit-school-classification"
  ? SchoolClassificationType
  : T extends "create-or-edit-district"
  ? DistrictType
  : T extends "create-or-edit-organization"
  ? OrganizationType
  : T extends "create-or-edit-user"
  ? UserType
  : null;

export type ModalConfig<T extends ConfigurationModalContentType> = {
  type: "create" | "update";
  data: IndexModalContextType<T>;
};

export type SmallWinsStoryType = "Success" | "Lesson Learned";
export type DataForDeleteModalType = {
  itemTitle: string;
  listTitle: string;
  _id: string;
  loading: boolean;
  deleteRoute: string;
} | null;

export type ConfigurationNamesType =
  | "Goals"
  | "Success Signs"
  | "Promising Practices"
  | "Teams"
  | "Schools"
  | "School Classifications"
  | "Districts"
  | "Organizations"
  | "Student Characteristics";

export type LocalStorageKeys =
  | "userToken"
  | "getStartedConfig"
  | "dashboard-config"
  | "user-data";

export type SmallWinStoryType = {
  type: "small wins story";
  successSigns: string[];
  studentCharacteristics: string[];
  promisingPractices: string[];
  author: string | null;
  storyAction: string;
  storyExperience: string;
  storyObservation: string;
};

export type LessonLearnedStoryType = {
  type: "lesson learned";
  successSigns: string[];
  author: string | null;
  storyAction: string;
  storyExperience: string;
  storyObservation: string;
};

export type StoryType = {
  type: "SW" | "LL"; // Small Win or Lesson Learned
  author?: UserType;
  promisingPractices: PromisingPracticeType[];
  storyAction: string;
  storyExperience: string;
  storyObservation: string;
  successSigns: SuccessSignType[];
  studentCharacteristics: StudentCharacteristicType[];
  files?: Array<any>;
  createdAt?: Date;
  reactions?: number;
  likes?: number;
  Insighfuls?: number;
  high5s?: number;
};

export type TeamGoalType = {
  goal: GoalType;
  promisingPractices: PromisingPracticeType[];
  studentCharacteristics: StudentCharacteristicType[];
  successSigns: SuccessSignType[];
};

export interface TimePeriod {
  fromMonth: string;
  fromYear: string;
  toYear: string;
  toMonth: string;
}

export type GetStartedConfigType = {
  selectedCategory: "School" | "District";
  school?: any;
  district?: DistrictType;
  categoryGoal?: TeamGoalType;
};

export type TeamFilterOptions = "District" | "School" | "Team";

export interface DashboardFilterConfig {
  visible: boolean;
  parent: TeamFilterOptions | "team-data" | "team" | "none";
}

export type DashboardLoadFilterParam = {
  parent: DashboardFilterConfig["parent"];
  teamConfig?: string;
  teadDataConfig?: {
    goal?: string;
    timePeriod?: { month: string; year: string };
    successSign?: string;
  };
};

export interface TeamModalFilterParams {
  school?: string;
  district?: string;
  team?: string;
}

export interface TeamDatamodalFilterParams {
  goal?: string;
  successSign?: string;
  timePeriod?: TimePeriod;
}

export type DashboardActiveFilter = {
  activeFilter: "School" | "District" | "Team";
  school?: KeyValueStateType<SchoolType>;
  district?: KeyValueStateType<DistrictType>;
  team?: KeyValueStateType<TeamType>;
  goal?: KeyValueStateType<TeamGoalType>;
  timePeriod?: TimePeriod;
  successSign?: KeyValueStateType<SuccessSignType>;
};

export type StoryReactionType = "High5" | "Like" | "Insighful";
export interface StoryReactionPayload {
  type: StoryReactionType;
  story: string;
  user: string;
}

export interface DashboardFilterParams
  extends TeamDatamodalFilterParams,
    TeamModalFilterParams {}
