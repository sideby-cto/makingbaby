import { useMemo } from "react";
import { useUserGlobalState } from "../useUserGlobalState";

export const useUserPermissionSummary = () => {
  const user = useUserGlobalState()[0];
  const permission = useMemo(() => {
    return {
      isAdmin: user?.permissionLevel! === "Admin",
      isOrganizationLeader: user?.permissionLevel === "Organization Leader",
      isDistrictLeader: user?.permissionLevel === "District Leader",
      isSchoolLeaderOrStaff:
        user?.permissionLevel === "School Leader" ||
        user?.permissionLevel === "Staff Member",
    };
  }, [user]);
  return { ...permission };
};
