import { createContext } from "react";
import { ProviderType, UserType } from "../utils/types";

export const LoggedInUserProvider = createContext<ProviderType<UserType>>([
  null,
  () => null,
]);

export const ModalDataContext = createContext<any>(null);
