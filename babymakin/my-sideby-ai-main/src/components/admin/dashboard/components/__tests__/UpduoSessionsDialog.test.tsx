
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UpduoSessionsDialog } from "../UpduoSessionsDialog";
import { useUpduoSessions } from "@/hooks/useUpduoSessions";

// Mock the hook
jest.mock("@/hooks/useUpduoSessions", () => ({
  useUpduoSessions: jest.fn(),
}));

// Mock child components to simplify testing
jest.mock("../sessions/SessionDetailView", () => ({
  SessionDetailView: ({ session }) => (
    <div data-testid="session-detail-view">{session.id}</div>
  ),
}));

jest.mock("../sessions/SessionListView", () => ({
  SessionListView: ({ sessions, onSelectSession }) => (
    <div data-testid="session-list-view">
      {sessions.map((session) => (
        <div
          key={session.id}
          data-testid={`session-item-${session.id}`}
          onClick={() => onSelectSession(session)}
        >
          {session.id}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../sessions/SessionSearch", () => ({
  SessionSearch: ({ value, onChange }) => (
    <input
      data-testid="session-search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

jest.mock("../sessions/SessionFilters", () => ({
  SessionFilters: ({
    dateRange,
    setDateRange,
    sessionType,
    setSessionType,
    hasTranscript,
    setHasTranscript,
    onReset,
  }) => (
    <div data-testid="session-filters">
      <select
        data-testid="session-type-filter"
        value={sessionType}
        onChange={(e) => setSessionType(e.target.value)}
      >
        <option value="all">All</option>
        <option value="PAIR">Pair</option>
        <option value="SINGLE">Single</option>
      </select>
      <button data-testid="reset-filters" onClick={onReset}>
        Reset
      </button>
    </div>
  ),
}));

describe("UpduoSessionsDialog Component", () => {
  const mockSessions = [
    {
      id: "session-1",
      createdAt: Date.now(),
      duration: 30,
      type: "PAIR",
      users: [{ id: "user1", firstName: "John", lastName: "Doe" }],
      knowledgeNodes: [{ id: "node1", name: "Topic 1", tags: [] }],
      transcriptContents: [{ speaker: "John", text: "Hello", startTime: 0, endTime: 5 }],
    },
    {
      id: "session-2",
      createdAt: Date.now() - 86400000,
      duration: 45,
      type: "SINGLE",
      users: [{ id: "user2", firstName: "Jane", lastName: "Smith" }],
      knowledgeNodes: [{ id: "node2", name: "Topic 2", tags: [] }],
      transcriptContents: [],
    },
  ];

  const mockLoadMore = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpduoSessions as jest.Mock).mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
      error: null,
      hasNextPage: true,
      loadMore: mockLoadMore,
    });
  });

  it("renders the dialog when open", () => {
    render(<UpduoSessionsDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByText("Upduo Sessions")).toBeInTheDocument();
  });

  it("doesn't render the dialog when closed", () => {
    render(<UpduoSessionsDialog open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText("Upduo Sessions")).not.toBeInTheDocument();
  });

  it("resets selected session when dialog closes", async () => {
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <UpduoSessionsDialog open={true} onOpenChange={onOpenChange} />
    );

    // Select a session
    fireEvent.click(screen.getByTestId("session-item-session-1"));
    
    // Verify we switched to detail view
    expect(screen.getByTestId("session-detail-view")).toBeInTheDocument();
    
    // Close the dialog
    rerender(<UpduoSessionsDialog open={false} onOpenChange={onOpenChange} />);
    
    // Reopen the dialog
    rerender(<UpduoSessionsDialog open={true} onOpenChange={onOpenChange} />);
    
    // Verify we're back to list view
    expect(screen.getByTestId("session-list-view")).toBeInTheDocument();
    expect(screen.queryByTestId("session-detail-view")).not.toBeInTheDocument();
  });

  it("switches to details tab when selecting a session", () => {
    render(<UpduoSessionsDialog open={true} onOpenChange={() => {}} />);
    
    // Initially we should be on the list tab
    expect(screen.getByTestId("session-list-view")).toBeInTheDocument();
    
    // Select a session
    fireEvent.click(screen.getByTestId("session-item-session-1"));
    
    // Now we should be on the details tab
    expect(screen.getByTestId("session-detail-view")).toBeInTheDocument();
    expect(screen.queryByTestId("session-list-view")).not.toBeInTheDocument();
  });

  it("filters sessions by search term", () => {
    render(<UpduoSessionsDialog open={true} onOpenChange={() => {}} />);
    
    // Enter search term
    fireEvent.change(screen.getByTestId("session-search"), {
      target: { value: "john" },
    });
    
    // Verify filter was applied
    expect(screen.getByTestId("session-item-session-1")).toBeInTheDocument();
    expect(screen.queryByTestId("session-item-session-2")).not.toBeInTheDocument();
  });

  it("filters sessions by session type", () => {
    render(<UpduoSessionsDialog open={true} onOpenChange={() => {}} />);
    
    // Select session type filter
    fireEvent.change(screen.getByTestId("session-type-filter"), {
      target: { value: "SINGLE" },
    });
    
    // Verify filter was applied
    expect(screen.queryByTestId("session-item-session-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-item-session-2")).toBeInTheDocument();
  });

  it("resets all filters", () => {
    render(<UpduoSessionsDialog open={true} onOpenChange={() => {}} />);
    
    // Apply some filters
    fireEvent.change(screen.getByTestId("session-search"), {
      target: { value: "john" },
    });
    
    fireEvent.change(screen.getByTestId("session-type-filter"), {
      target: { value: "SINGLE" },
    });
    
    // Reset filters
    fireEvent.click(screen.getByTestId("reset-filters"));
    
    // Verify all sessions are shown again
    expect(screen.getByTestId("session-item-session-1")).toBeInTheDocument();
    expect(screen.getByTestId("session-item-session-2")).toBeInTheDocument();
  });
  
  it("returns to list view from details view", async () => {
    render(<UpduoSessionsDialog open={true} onOpenChange={() => {}} />);
    
    // Select a session to go to details
    fireEvent.click(screen.getByTestId("session-item-session-1"));
    
    // Verify we're on details view
    expect(screen.getByTestId("session-detail-view")).toBeInTheDocument();
    
    // Get the Back to List button
    const backButton = screen.getByRole("button", { name: /back to list/i });
    
    // Click it
    fireEvent.click(backButton);
    
    // Verify we're back on list view
    expect(screen.getByTestId("session-list-view")).toBeInTheDocument();
    expect(screen.queryByTestId("session-detail-view")).not.toBeInTheDocument();
  });
});
