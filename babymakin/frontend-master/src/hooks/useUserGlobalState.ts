import React from "react";
import { UserContext } from "../infrastructure/contexts";

export const useUserGlobalState = () => React.useContext(UserContext);
