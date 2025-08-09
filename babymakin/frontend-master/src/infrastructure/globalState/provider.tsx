import React, { ReactNode, useState } from "react";
import { UserType } from "../../core";
import { UserContext } from "../contexts";
import { DashboardFilterContextProvider } from "../../contexts/dashboardFilter.context";

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({
  children,
}) => {
  const userValue = useState<UserType | null>(null);

  return (
    <UserContext.Provider value={userValue}>
      <DashboardFilterContextProvider>
        {children}
      </DashboardFilterContextProvider>
    </UserContext.Provider>
  );
};
