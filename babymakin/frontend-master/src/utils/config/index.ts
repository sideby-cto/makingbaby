import { UserStatusType } from "../types";

export * from "./server.config";
export const UserPermissions: UserStatusType[] = [
  "Admin",
  "Organization Leader",
  "District Leader",
  "School Leader",
  "Staff Member",
];
