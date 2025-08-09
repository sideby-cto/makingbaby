/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from "react";
import querystring from "query-string";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserGlobalState } from "./useUserGlobalState";
import {
  ClearLocalStorage,
  DecodeToken,
  GetFromLocalStorage,
  SaveOnLocalStorage,
} from "../utils";
import { useTrackLogin } from "../utils/mixPanel/trackingHooks/useTrackLogin";

export const useRootLayout = () => {
  const [user, setUserData] = useUserGlobalState();
  const navigate = useNavigate();
  const location = useLocation();

  const userExistsAndIsAuthenticated = useMemo(() => {
    return Boolean(user);
  }, [user]);

  useEffect(() => {
    const userToken = GetFromLocalStorage("userToken");
    const queryToken = querystring.parse(location.search);
    let userIdData: any | null;

    if (queryToken?.token) {
      ClearLocalStorage("dashboard-config");
      ClearLocalStorage("user-data");
      ClearLocalStorage("userToken");
      SaveOnLocalStorage("userToken", queryToken.token);
      userIdData = DecodeToken(queryToken.token as string);
    } else if (userToken) {
      userIdData = DecodeToken(userToken);
      const userData = GetFromLocalStorage("user-data");
      if (Boolean(userData)) {
        setUserData(userData);
        const currentRoute = location.pathname;
        if (currentRoute === "/") navigate("/dashboard");
        return;
      }
    } else return navigate("/login");

    navigate("/welcome", { state: { user: userIdData } });
  }, [location.search]);

  useTrackLogin(querystring.parse(location.search));

  return {
    isAuthenticated: userExistsAndIsAuthenticated,
  };
};
