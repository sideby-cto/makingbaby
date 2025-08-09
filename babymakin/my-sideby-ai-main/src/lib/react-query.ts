
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale to ensure fresh fetches
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: 'always', // Always refetch when component mounts
      retry: 1,
    },
  },
});
