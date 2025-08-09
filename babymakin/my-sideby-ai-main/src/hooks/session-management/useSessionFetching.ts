
import { useToast } from "@/hooks/use-toast";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionsPage, UpduoSession } from "./types";
import { useSessionTranscriptStorage } from "./useSessionTranscriptStorage";

export function useSessionFetching(count: number = 50, includeTranscript = false) {
  const { toast } = useToast();
  const { shouldAutoStoreSession, storeSessionTranscriptInternal } = useSessionTranscriptStorage();

  const fetchSessionsPage = async ({ pageParam }: { pageParam?: string }): Promise<SessionsPage> => {
    try {
      // Create an object with the query parameters
      const queryParams: Record<string, string> = { count: count.toString() };
      if (pageParam) {
        queryParams.cursor = pageParam;
      }
      if (includeTranscript) {
        queryParams.includeTranscript = 'true';
      }

      console.log(`Fetching sessions page: cursor=${pageParam || 'none'}, count=${count}, includeTranscript=${includeTranscript}`);

      // Create an AbortController for the timeout with reduced timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Reduced from 60s to 45s

      const { data, error } = await supabase.functions.invoke(
        "upduo-sessions",
        {
          body: queryParams,
        }
      );

      // Clear the timeout if the request completes
      clearTimeout(timeoutId);

      if (error) {
        console.error("Error from Upduo sessions function:", error);
        throw error;
      }

      // Check for error in response data
      if (data.error) {
        console.error("Error in response:", data.error, data.details);
        throw new Error(data.error);
      }

      const response = data as any;

      // Log cache status if available
      if (response.cacheStatus) {
        console.log(`Cache status: ${response.cacheStatus}`);
      }

      // Safety checks to ensure expected structure
      if (!response.data?.self?.group?.sessions) {
        console.error("Unexpected response structure:", response);
        // Return empty result instead of throwing
        return {
          sessions: [],
          nextCursor: undefined,
          hasNextPage: false,
        };
      }

      // Auto-store reflection sessions (only if we have transcript data)
      const sessions = response.data.self.group.sessions.items || [];
      if (sessions.length > 0 && includeTranscript) {
        // Process each session to check if it's a reflection and store it
        // Use setTimeout to avoid blocking the main response
        setTimeout(() => {
          sessions.forEach((session: UpduoSession) => {
            if (shouldAutoStoreSession(session)) {
              console.log(
                `Auto-storing transcript for reflection session: ${session.id}`
              );
              storeSessionTranscriptInternal(session);
            }
          });
        }, 0);
      }

      console.log(`Successfully fetched ${sessions.length} sessions`);

      return {
        sessions: sessions,
        nextCursor: response.data.self.group.sessions.hasNextPage
          ? response.data.self.group.sessions.cursor
          : undefined,
        hasNextPage: response.data.self.group.sessions.hasNextPage,
      };
    } catch (error) {
      console.error("Error fetching sideby sessions:", error);
      
      // Show toast only for the first page load (critical errors)
      if (!pageParam) {
        toast({
          title: "Error fetching sideby sessions",
          description: "There was a problem connecting to the sideby API. Please try again later.",
          variant: "destructive",
        });
      }
      
      // Return empty result instead of throwing to prevent UI from breaking
      return {
        sessions: [],
        nextCursor: undefined,
        hasNextPage: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["upduoSessions", count, includeTranscript],
    queryFn: fetchSessionsPage,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // Reduced to 5 minutes since we have Redis cache
    retry: 2, // Reduced retry attempts
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000), // Faster exponential backoff
    gcTime: 10 * 60 * 1000, // Reduced cache time to 10 minutes with Redis backing
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  };
}
