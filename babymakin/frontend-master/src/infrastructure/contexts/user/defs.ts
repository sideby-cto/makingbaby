import { createContext } from "react";
import { UserType } from "../../../core";
import { ContextProviderWithStateValuesType } from "../interfaces";

export const UserContext = createContext<
  ContextProviderWithStateValuesType<UserType>
>([null, () => null]);
