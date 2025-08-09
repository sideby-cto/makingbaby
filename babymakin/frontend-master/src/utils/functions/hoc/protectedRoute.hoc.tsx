import { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useUserGlobalState } from "../../../hooks/useUserGlobalState";

interface ProtectRouteProps {
  WrappedComponent: ComponentType<any>;
  redirectTo: string;
  allowedUser?: string;
  blockedUser?: string;
}

export const protectRoute = (_props: ProtectRouteProps) => {
  return (props: any) => {
    const user = useUserGlobalState()[0];
    const { WrappedComponent, redirectTo, allowedUser, blockedUser } = _props;
    if (
      (allowedUser && user?.permissionLevel !== allowedUser) ||
      (blockedUser && user?.permissionLevel === blockedUser)
    ) {
      return <Navigate to={redirectTo} replace />;
    }

    return <WrappedComponent {...props} />;
  };
};
