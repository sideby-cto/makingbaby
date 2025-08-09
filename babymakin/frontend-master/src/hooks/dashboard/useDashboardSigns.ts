import { useMemo } from "react";
import { IDashboardFilterState } from "./interface";


export const useDashboardSigns = (
  dashboardData: any,
  filters: IDashboardFilterState,
) => {
  const dashboardSigns = useMemo(() => {
  
    // return early if dashboardData is not valid
    if (!dashboardData) return [];
  
    const successKey = filters?.successSign?.key;

    if ( successKey === undefined ) return [];
  
    // first look for the "All" case
    if (successKey === "All") {
      if (dashboardData?.successSigns) {
        const { successSigns } = dashboardData;
        if (successSigns && Array.isArray(successSigns)) {
          return successSigns.map((sign: any, idx: number) => {
            return {
              ...sign,
              _id: sign._id,
            };
          });
        } 
      }     
    }
  
    // next handle the selection of a single practice case
    if ( Array.isArray(dashboardData?.successSigns) ) {
      if ( dashboardData?.successSigns.length === 0 ) {
        return [];
      } 
      // there are two places to get the data from: filter and dashboardData.
      // the data in filter has the incorrect number of stories for the practice 
      // in some cases.
      // so, if possible try to get the data from the dashboardData object first.
      if ( ( dashboardData?.successSigns.length >= 1 ) &&
      ( dashboardData?.successSigns[0].id === successKey ) ){
            return dashboardData.successSigns;
      } 
    }   
  
    // if all else fails, try to return the value from the filters
    const val = filters.successSign?.value;
    if (val) {
      return [val];
    }
  
    return [];
  
  }, [dashboardData, filters]);
  
  return dashboardSigns;
  };
  

