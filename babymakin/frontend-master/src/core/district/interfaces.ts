import { TeamGoalType } from "../goal";
import { OrganizationType } from "../organization";

export type DistrictType = {
  _id: string;
  createdAt: Date;
  name: string;
  districtGoals: TeamGoalType[];
  organization?: OrganizationType;
};
