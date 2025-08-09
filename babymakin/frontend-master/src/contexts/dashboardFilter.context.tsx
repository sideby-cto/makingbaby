import { createContext } from "react";
import { useDashboardFilter } from "../hooks";
import {
  FilterAction,
  IDashboardFilterState,
  ReducerType,
} from "../hooks/dashboard/interface";

interface Props {
  children: React.ReactNode;
}

interface DashboardFilterContextValueType {
  filter: IDashboardFilterState;
  reducer: ReducerType<IDashboardFilterState, FilterAction>;
  updateFilter: React.Dispatch<FilterAction>;
  actions: ReturnType<typeof useDashboardFilter>["actions"];
}

export const DashboardFilterContext =
  createContext<DashboardFilterContextValueType | null>(null);

export const DashboardFilterContextProvider = ({ children }: Props) => {
  const { filter, reducer, updateFilter, actions } = useDashboardFilter();
  return (
    <DashboardFilterContext.Provider
      value={{ filter, reducer, updateFilter, actions }}
    >
      {children}
    </DashboardFilterContext.Provider>
  );
};
