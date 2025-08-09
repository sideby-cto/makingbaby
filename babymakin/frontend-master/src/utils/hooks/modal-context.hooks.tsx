import { useContext } from "react";
import { LoggedInUserProvider } from "../../contexts";

export const useUser = () => {
  return useContext(LoggedInUserProvider)[0];
};

export const useSetLoggedinUser = () => {
  return useContext(LoggedInUserProvider)[1];
};
