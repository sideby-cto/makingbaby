import { useMemo } from "react";
import { IDashboardFilterState } from "./interface";

export const useDashboardPractices = (
  dashboardData: any,
  filters: IDashboardFilterState
) => {
  const dashboardPractices = useMemo(() => {

    // return early if dashboardData is not valid
    if (!dashboardData) return [];

    const promisingPracticeKey = filters?.promisingPractice?.key;
    if ( promisingPracticeKey === undefined ) return [];

    // first look for the "All" case
    if (promisingPracticeKey === "All") {
      if (dashboardData?.promisingPractices) {
        const { promisingPractices } = dashboardData;
        if (promisingPractices && Array.isArray(promisingPractices)) {
          return promisingPractices.map((practice: any, idx: number) => {
            return {
              ...practice,
              _id: practice._id,
            };
          });
        } 
      }     
    }

    // next handle the selection of a single practice case
    if ( Array.isArray(dashboardData?.promisingPractices) ) {
      if ( dashboardData?.promisingPractices.length === 0 ) {
        return [];
      } 
      // there are two places to get the data from: filter and dashboardData.
      // the data in filter has the incorrect number of stories for the practice 
      // in some cases.
      // so, if possible try to get the data from the dashboardData object first.
      if ( ( dashboardData?.promisingPractices.length >= 1 ) &&
      ( dashboardData?.promisingPractices[0].id === promisingPracticeKey ) ){
            return dashboardData.promisingPractices;
      } 
    }   

    // if all else fails, try to return the value from the filters
    const val = filters.promisingPractice?.value;
    if (val) {
      return [val];
    }

    return [];

  }, [dashboardData, filters]);

  return dashboardPractices;
};
