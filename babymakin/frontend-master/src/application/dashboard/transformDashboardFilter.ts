import { IUpdateDashboardDataQueryPayload } from "../../hooks/dashboard/interface";

export const transformDashboardFilters = (
  filters: Partial<IUpdateDashboardDataQueryPayload>
) => {
  if (!filters) return "";
  let params = "";

  params += `from=${filters.fromDate}&to=${filters.toDate}`;

  if (!filters?.insights && filters?.team && filters?.team !== "All") {
    params += `&team=${filters.team}`;
  }

  if (filters?.district && filters?.district !== "All") {
    params += `&district=${filters.district}`;
  }

  if (filters?.school && filters?.school !== "All") {
    params += `&school=${filters.school}`;
  }

  if (filters?.goal && filters?.goal !== "All") {
    params += `&goal=${filters.goal}`;
  }

  if (!filters?.insights && filters?.successSign && filters?.successSign !== "All") {
    params += `&successSign=${filters.successSign}`;
  }

  if (!filters?.insights && filters?.promisingPractices && filters?.promisingPractices !== "All") {
    params += `&promisingPractices=${filters.promisingPractices}`;
  }

  if ( !filters?.insights &&
    filters?.studentCharacteristics &&
    filters?.studentCharacteristics !== "All"
  ) {
    params += `&studentCharacteristics=${filters.studentCharacteristics}`;
  }

  if (!filters?.insights && filters?.userId) {
    params += `&userId=${filters.userId}`;
  }

  if (!filters?.insights && filters?.storyType) {
    params += `&storyType=${filters?.storyType}`;
  }

  return params;
};
