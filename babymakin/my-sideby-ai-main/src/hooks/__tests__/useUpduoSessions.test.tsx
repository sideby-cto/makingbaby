
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from "@testing-library/react";
import { useUpduoSessions } from "../useUpduoSessions";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Setup a wrapper with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUpduoSessions Hook", () => {
  const mockResponse = {
    data: {
      self: {
        id: "user-123",
        group: {
          id: "group-123",
          sessions: {
            id: "sessions-list",
            items: [
              {
                id: "session-1",
                createdAt: Date.now(),
                duration: 30,
                type: "PAIR",
                users: [
                  { id: "user1", firstName: "John", lastName: "Doe" },
                ],
                knowledgeNodes: [
                  { id: "node1", name: "Topic 1", tags: [] },
                ],
                transcriptContents: [
                  { speaker: "John", text: "Hello", startTime: 0, endTime: 5 },
                ],
              },
            ],
            hasNextPage: true,
            cursor: "next-page-cursor",
          },
        },
      },
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (supabase.functions.invoke as any).mockResolvedValue({
      data: mockResponse,
      error: null,
    });
  });

  it("should fetch sessions correctly", async () => {
    const { result } = renderHook(() => useUpduoSessions(50), {
      wrapper: createWrapper(),
    });

    // Initially we expect loading state and empty sessions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessions).toEqual([]);

    // Wait for the query to complete
    await waitFor(() => !result.current.isLoading);

    // After loading, we expect the sessions to be populated
    expect(result.current.sessions).toEqual(mockResponse.data.self.group.sessions.items);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should handle loadMore correctly", async () => {
    const { result } = renderHook(() => useUpduoSessions(50), {
      wrapper: createWrapper(),
    });

    // Wait for the initial query to complete
    await waitFor(() => !result.current.isLoading);

    // Update the mock for the next page
    const nextPageMock = {
      ...mockResponse,
      data: {
        ...mockResponse.data,
        self: {
          ...mockResponse.data.self,
          group: {
            ...mockResponse.data.self.group,
            sessions: {
              ...mockResponse.data.self.group.sessions,
              items: [
                {
                  id: "session-2",
                  createdAt: Date.now(),
                  duration: 45,
                  type: "SINGLE",
                  users: [
                    { id: "user2", firstName: "Jane", lastName: "Doe" },
                  ],
                  knowledgeNodes: [
                    { id: "node2", name: "Topic 2", tags: [] },
                  ],
                  transcriptContents: [],
                },
              ],
              hasNextPage: false,
              cursor: null,
            },
          },
        },
      },
    };
    
    (supabase.functions.invoke as any).mockResolvedValue({
      data: nextPageMock,
      error: null,
    });

    // Call loadMore
    await result.current.loadMore();

    // After loadMore, we expect fetchNextPage to be called
    // and another page of sessions to be appended
    await waitFor(() => {
      expect(result.current.sessions.length).toBeGreaterThan(1);
    });
  });

  it("should handle errors correctly", async () => {
    // Mock an error response
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: "Test error" },
    });

    const { result } = renderHook(() => useUpduoSessions(50), {
      wrapper: createWrapper(),
    });

    // Wait for the query to complete (with error)
    await waitFor(() => !result.current.isLoading);

    // After error, we expect the error to be populated
    expect(result.current.error).not.toBe(null);
    expect(result.current.sessions).toEqual([]);
  });

  it("should pass the correct parameters to the API", async () => {
    renderHook(() => useUpduoSessions(30), {
      wrapper: createWrapper(),
    });

    // Wait for the query to complete
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith("upduo-sessions", {
        body: { count: "30" },
      });
    });
  });

  it("should include transcript when requested", async () => {
    renderHook(() => useUpduoSessions(25, true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith("upduo-sessions", {
        body: { count: "25", includeTranscript: "true" },
      });
    });
  });
});
