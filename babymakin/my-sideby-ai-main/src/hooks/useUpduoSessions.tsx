
import { UpduoSession } from "./session-management/types";
import { useSessionFetching } from "./session-management/useSessionFetching";
import { useSessionTranscriptStorage } from "./session-management/useSessionTranscriptStorage";

export type { UpduoSession } from "./session-management/types";
export type { UpduoSessionsResponse } from "./session-management/types";

export function useUpduoSessions(count: number = 50, includeTranscript = false) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useSessionFetching(count, includeTranscript);

  const { storeSessionTranscript } = useSessionTranscriptStorage();
  
  // Flatten the pages of sessions into a single array
  const sessions = data?.pages.flatMap((page) => page.sessions) || [];

  // Function to load more sessions
  const loadMore = async (): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
    return Promise.resolve();
  };

  // Enhanced function to manually store a session transcript
  const handleStoreSessionTranscript = async (
    sessionId: string
  ): Promise<boolean> => {
    return storeSessionTranscript(sessionId, sessions);
  };

  return {
    sessions,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage: !!hasNextPage,
    loadMore,
    refetch,
    storeSessionTranscript: handleStoreSessionTranscript,
  };
}
