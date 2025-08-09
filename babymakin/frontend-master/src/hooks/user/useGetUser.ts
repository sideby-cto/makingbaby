import { useQuery } from "@tanstack/react-query";
import { Queries } from "../../api";

export function useGetUser(id: string) {
  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ["user", id ?? ""],
    queryFn: () => Queries.getUser(id),
    enabled: false,
  });

  return {
    userData: data,
    fetchingUser: isLoading,
    refetch,
    isError,
  };
}
