/* eslint-disable no-restricted-globals */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClearLocalStorage, SaveOnLocalStorage } from "../utils";
import { useGetUser } from "./user";
import { useUserGlobalState } from "./useUserGlobalState";

export const useLandingPage = () => {
  const [userId, setUserId] = useState("");
  const setGlobalUserState = useUserGlobalState()[1];
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const { fetchingUser, refetch, userData, isError } = useGetUser(userId);

  useEffect(() => {
    if ((locationState as any).user) {
      setUserId((locationState as any).user.sub);
    }
  }, [locationState]);

  useEffect(() => {
    (async function () {
      if (userId !== "") {
        refetch();
      }
    })();
  }, [userId, refetch]);

  useEffect(() => {
    if (userData && !userData.inactive) {
      setGlobalUserState(userData);
      SaveOnLocalStorage("user-data", userData);
      navigate("/get-started");
    }
  }, [userData]);

  useEffect(() => {
    if (isError || userData?.inactive) {
      navigate("/expired-session");
      ClearLocalStorage("userToken");
      ClearLocalStorage("user-data");
    }
  }, [isError, userData]);

  return {
    fetchingUser,
  };
};
