import { OrganizationType } from "../organization";
import { DistrictType } from "../district";
import { SchoolType } from "../school";
import { TeamType } from "../team";

export type UserStatusType =
  | "Admin"
  | "Organization Leader"
  | "District Leader"
  | "School Leader"
  | "Staff Member";

export type UserType = {
  name: string;
  permissionLevel: UserStatusType;
  email: string;
  organization?: OrganizationType;
  district?: DistrictType;
  schools?: Array<SchoolType>;
  createdAt: Date;
  teams?: Array<TeamType>;
  mainTeam?: TeamType;
  sub?: string;
  id?: string;
};
