import { IDashboardFilterState } from "../../../../hooks/dashboard/interface";

export interface DashboardFilterOptionsProps {
  options: { component: JSX.Element; display: boolean }[];
}

export interface DashboardFilterProps {
  isAdmin: boolean;
  isOrganizationLeader: boolean;
  isDistrictLeader: boolean;
  isSchoolLeaderOrStaff: boolean;
  isAtAllDataPage: boolean;
  isInsightsPage: boolean;
  districtOptions: LabelValueRef[];
  handleOnChangeDistrict: (e: any) => void;
  handleOnChangeSchool: (e: any) => void;
  handleOnChangeTeam: (e: any) => void;
  handleOnChangePerson: (e: any) => void;
  handleOnChangeGoal: (e: any) => void;
  handleOnChangeStoryType: (e: any) => void;
  handleOnChangeSign: (e: any) => void;
  handleOnChangePractice: (e: any) => void;
  handleOnChangeCharacteristic: (e: any) => void;
  filter: IDashboardFilterState;
  schoolOptions: (
    | LabelValueRef
    | {
        label: string;
        value: string;
      }
  )[];
  teamOptions: (
    | LabelValueRef
    | {
        label: string;
        value: string;
      }
  )[];
  personOptions: (
    | LabelValueRef
    | {
        label: string;
        value: string;
      }
  )[];
  goalOptions: (
    | LabelValueRef
    | {
        label: string;
        value: string;
      }
  )[];
  storyTypeOptions: LabelValue[];
  filterStateActions: {
    setStoryType: (payload: any) => void;
  };
  signOptions: (
    | LabelValueRef
    | {
        label: string;
        value: string;
      }
  )[];
  practiceOptions: (
    | LabelValueRef
    | {
        label: string;
        value: string;
      }
  )[];
  characteristicOptions: (
    | LabelValueRef
    | {
        label: string;
        value: string;
      }
  )[];
  months: string[];
  years: string[];
  selectTimePeriod: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickApplyHandler: () => void;
}
