import { useQueries, useQuery } from "@tanstack/react-query";
import {
  allQueryOptions,
  GetInitialDashboardDataParams,
  Queries,
} from "../../api";
import { GetUsersParam } from "../../hooks/user/useUserBank";

export const useGetDataForGetStartedPage = () => {
  const [
    { data: allGoals, isLoading: loadingGoals, refetch: refetchGoals },

    {
      data: allDistricts,
      isLoading: loadingDistricts,
      refetch: refetchDistricts,
    },
    { data: allSchools, isLoading: loadingSchools, refetch: refetchSchools },
  ] = useQueries({
    queries: [
      {
        queryKey: ["goals"],
        queryFn: Queries.getGoals,
        staleTime: Infinity,
        ...allQueryOptions,
      },

      {
        queryKey: ["districts"],
        queryFn: Queries.getDistricts,
        staleTime: Infinity,
        ...allQueryOptions,
      },
      {
        queryKey: ["schools"],
        queryFn: Queries.getSchools,
        staleTime: Infinity,
        ...allQueryOptions,
      },
    ],
  });
  return {
    collections: {
      allDistricts,
      allSchools,
      allGoals,
    },
    collectionLoadingStates: {
      loadingDistricts,
      loadingSchools,
      loadingGoals,
    },
    refetchCollections: {
      refetchDistricts,
      refetchSchools,
      refetchGoals,
    },
  };
};

const getUsersParam: GetUsersParam = {
  currentPage: 0,
  enabled: true,
  pageSize: 10000,
  filter: "",
};

export const useCollections = () => {
  const [
    { data: allGoals, isLoading: loadingGoals, refetch: refetchGoals },
    {
      data: allPromisingPractices,
      isLoading: loadingPromisingPractices,
      refetch: refetchPromisingPractices,
    },
    {
      data: allSuccessSigns,
      isLoading: loadingSuccessSigns,
      refetch: refetchSuccessSigns,
    },
    {
      data: allStudentCharacteristics,
      isLoading: loadingStudentCharacteristics,
      refetch: refetchStudentCharacteristics,
    },
    {
      data: allOrganizations,
      isLoading: loadingOrganizations,
      refetch: refetchOrganizations,
    },
    {
      data: allDistricts,
      isLoading: loadingDistricts,
      refetch: refetchDistricts,
    },
    { data: allSchools, isLoading: loadingSchools, refetch: refetchSchools },
    {
      data: allSchoolClassifications,
      isLoading: loadingSchoolClassifications,
      refetch: refetchSchoolClassifications,
    },
    { data: allTeams, isLoading: loadingTeams, refetch: refetchTeams },
    { data: allUsers, isLoading: loadingUsers, refetch: refetchUsers },
  ] = useQueries({
    queries: [
      {
        queryKey: ["goals"],
        queryFn: Queries.getGoals,
        staleTime: Infinity,
        ...allQueryOptions,
      },
      {
        queryKey: ["promising-practices"],
        queryFn: Queries.getPromisingPractices,
        ...allQueryOptions,
      },
      {
        queryKey: ["success-signs"],
        queryFn: Queries.getSuccessSigns,
        ...allQueryOptions,
      },
      {
        queryKey: ["student-characteristics"],
        queryFn: Queries.getStdCharacteristics,
        ...allQueryOptions,
      },
      {
        queryKey: ["organizations"],
        queryFn: Queries.getOrganizations,
        staleTime: Infinity,
        ...allQueryOptions,
      },
      {
        queryKey: ["districts"],
        queryFn: Queries.getDistricts,
        staleTime: Infinity,
        ...allQueryOptions,
      },
      {
        queryKey: ["schools"],
        queryFn: Queries.getSchools,
        staleTime: Infinity,
        ...allQueryOptions,
      },
      {
        queryKey: ["school-classifications"],
        queryFn: Queries.getSchoolClassifications,
        staleTime: Infinity,
        ...allQueryOptions,
      },
      {
        queryKey: ["teams"],
        queryFn: Queries.getTeams,
        staleTime: Infinity,
        ...allQueryOptions,
      },
      {
        queryKey: [
          `get-users-${getUsersParam.currentPage}-${getUsersParam.pageSize}-${getUsersParam.filter}`,
        ],
        queryFn: () => Queries.getUsers(getUsersParam),
        staleTime: Infinity,
        ...allQueryOptions,
      },
    ],
  });
  return {
    collections: {
      allOrganizations,
      allDistricts,
      allSchools,
      allSchoolClassifications,
      allTeams,
      allUsers,
      allGoals,
      allPromisingPractices,
      allStudentCharacteristics,
      allSuccessSigns,
    },
    collectionLoadingStates: {
      loadingOrganizations,
      loadingDistricts,
      loadingSchools,
      loadingSchoolClassifications,
      loadingTeams,
      loadingUsers,
      loadingGoals,
      loadingStudentCharacteristics,
      loadingSuccessSigns,
      loadingPromisingPractices,
    },
    refetchCollections: {
      refetchOrganizations,
      refetchDistricts,
      refetchSchools,
      refetchSchoolClassifications,
      refetchTeams,
      refetchUsers,
      refetchGoals,
      refetchStudentCharacteristics,
      refetchSuccessSigns,
      refetchPromisingPractices,
    },
  };
};

export const useDistrictSchools = (district: string) => {
  const {
    data,
    refetch,
    isLoading: isFetchingDistrictSchools,
  } = useQuery({
    queryKey: ["district-schools", district],
    queryFn: () => Queries.getDistrictScools({ district }),
    enabled: district ? true : false,
    initialData: [],
    refetchOnWindowFocus: false,
    ...allQueryOptions,
  });
  return {
    schools: data,
    refetch,
    isFetchingDistrictSchools,
  };
};

export const useInitialDashboardData = (
  params: GetInitialDashboardDataParams
) => {
  const hasRequiredParams = [params.fromDate, params.toDate].every(
    (value) => !!value
  );
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", params],
    queryFn: () => Queries.getInitialDashboardData(params),
    ...allQueryOptions,
    enabled: hasRequiredParams,
  });

  return {
    data,
    isLoading,
    refetch,
  };
};

export function useGetUser(param?: { id: string; enabled: boolean }) {
  const {
    data: userData,
    isLoading: fetchingUser,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => Queries.getUser(param?.id ?? ""),
    enabled: param?.enabled ?? false,
  });

  return {
    userData,
    fetchingUser,
    isError,
    error,
  };
}

export function useGetStoryData(params: { id: string; enabled?: boolean }) {
  const { id, enabled } = params;
  const { data, refetch } = useQuery({
    queryKey: ["story-data", id],
    queryFn: () => Queries.getStoryData(id),
    enabled,
  });
  return { story: data, refetch };
}

export function useGetUsers({
  enabled,
  ...params
}: {
  currentPage: number;
  pageSize: number;
  enabled: boolean;
  filter?: string;
}) {
  const queryData = useQuery({
    queryKey: [
      `get-users-${params.currentPage}-${params.pageSize}-${params.filter}`,
    ],
    queryFn: () => Queries.getUsers(params),
    enabled: !!enabled,
  });
  return queryData;
}
