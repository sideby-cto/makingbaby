import { useMemo } from "react";
import { IDashboardFilterState } from "./interface";

export const useDashboardCharacteristics = (
  dashboardData: any,
  filters: IDashboardFilterState,
) => {
  const dashboardCharacteristics = useMemo(() => {
  
    // return early if dashboardData is not valid
    if (!dashboardData) return [];
  
    const characteristicKey = filters?.characteristic?.key;

    if ( characteristicKey === undefined ) return [];
  
    // first look for the "All" case
    if (characteristicKey === "All") {
      if (dashboardData?.studentCharacteristics) {
        const { studentCharacteristics } = dashboardData;
        if (studentCharacteristics && Array.isArray(studentCharacteristics)) {
          return studentCharacteristics.map((characteristic: any, idx: number) => {
            return {
              ...characteristic,
              _id: characteristic._id,
            };
          });
        } 
      }     
    }
  
    // next handle the selection of a single practice case
    if ( Array.isArray(dashboardData?.studentCharacteristics) ) {
      if ( dashboardData?.studentCharacteristics.length === 0 ) {
        return [];
      } 
      // there are two places to get the data from: filter and dashboardData.
      // the data in filter has the incorrect number of stories for the practice 
      // in some cases.
      // so, if possible try to get the data from the dashboardData object first.
      if ( ( dashboardData?.studentCharacteristics.length >= 1 ) &&
      ( dashboardData?.studentCharacteristics[0].id === characteristicKey ) ){
            return dashboardData.studentCharacteristics;
      } 
    }   
  
    // if all else fails, try to return the value from the filters
    const val = filters.characteristic?.value;
    if (val) {
      return [val];
    }
  
    return [];
  
  }, [dashboardData, filters]);
  
  return dashboardCharacteristics;
  };
  

