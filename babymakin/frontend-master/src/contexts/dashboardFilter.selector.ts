import { useContext } from "react";
import { DashboardFilterContext } from "./dashboardFilter.context";
import { ModalDataContext } from "./contexts";

export const useGlobalDashboardFilter = () => {
  return useContext(DashboardFilterContext)?.filter;
};

export const useUpdateGlobalDashboardFilter = () =>
  useContext(DashboardFilterContext)?.updateFilter;

export const useGlobalDashboardState = () => useContext(DashboardFilterContext);
export const useGlobalDashboardStateActions = () =>
  useContext(DashboardFilterContext)?.actions;

export const useModalDataState = () => useContext(ModalDataContext);
