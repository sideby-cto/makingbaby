// all query functions for react-query should be written here
import { transformDashboardFilters } from "../application";
import { API, ENDPOINTS } from "./http-common";

const {
  goals,
  promisingPractice,
  studentSuccessSign,
  studentCharacteristics,
  organizations,
  districts,
  schools,
  schoolClassifications,
  teams,
  users,
  story,
  dashboard,
} = ENDPOINTS;

interface GetUserParams {
  currentPage?: number;
  pageSize?: number;
  fiter?: string;
}

export interface GetInitialDashboardDataParams {
  school?: string;
  district?: any;
  goal?: string;
  team?: string;
  fromDate?: Date;
  toDate?: Date;
  insights?: boolean;
}

export const Queries = {
  getUser: async (userId: string) => {
    const response = await API.get(`${users}/${userId}`);
    return response.data;
  },
  getGoals: async () => {
    const response = await API.get(goals);
    return response.data;
  },
  getPromisingPractices: async () => {
    const response = await API.get(promisingPractice);
    return response.data;
  },
  getSuccessSigns: async () => {
    const response = await API.get(studentSuccessSign);
    return response.data;
  },
  getStdCharacteristics: async () => {
    const response = await API.get(studentCharacteristics);
    return response.data;
  },
  getOrganizations: async () => {
    const response = await API.get(organizations);
    return response.data;
  },
  getDistricts: async () => {
    const response = await API.get(districts);
    return response.data;
  },
  getSchools: async () => {
    const response = await API.get(schools);
    return response.data;
  },
  getSchoolClassifications: async () => {
    const response = await API.get(schoolClassifications);
    return response.data;
  },
  getSchool: async (id: string) => {
    const path = `${schools}/${id}`;
    const response = await API.get(path);
    return response.data;
  },
  getTeams: async () => {
    const response = await API.get(teams);
    return response.data;
  },
  getUsers: async (params?: GetUserParams) => {
    const response = await API.get(users, { params });
    return response.data;
  },
  getStories: async (param: { school?: string; district?: string }) => {
    const query = param.district
      ? `district=${param.district}`
      : param.school
      ? `school=${param.school}`
      : null;
    const response = await API.get(`${story}?${query}`);
    return response.data;
  },
  getDistrictScools: async ({ district }: { district: string }) => {
    const response = await API.get(`${districts}/${district}/schools`);
    return response.data;
  },

  getInitialDashboardData: async (params: GetInitialDashboardDataParams) => {
    const formattedParams = transformDashboardFilters(params);
    const response = await API.get(
      `${dashboard}/getstarted?${formattedParams}`
    );
    return response.data;
  },
  getStoryData: async (id?: string) => {
    const { data } = await API.get(`${story}/${id}`);
    return data;
  },

  getStory: async (id: string) => {
    const path = `${story}/${id}`;
    const { data } = await API.get(path);
    return data;
  },
};

export const allQueryOptions = {
  retry: 2,
  onError: (error: any) => {
    console.error(
      `${
        error.request.status === 500 ? "Internal Server Error" : error.message
      }, please try again later`
    );
  },
};
