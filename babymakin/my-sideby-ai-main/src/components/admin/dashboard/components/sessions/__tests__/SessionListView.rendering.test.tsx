
import React from "react";
import { render, screen } from "@testing-library/react";
import { SessionListView } from "../SessionListView";
import { useInView } from "react-intersection-observer";
import { createMockSessions, setupMocks, createTestProps, createDefaultFilterProps } from "./testUtils";

// Run setup
setupMocks();

describe("SessionListView Rendering States", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });
  });

  it("renders the session list when there are sessions", () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const mockSessions = createMockSessions();
    const filterProps = createDefaultFilterProps();

    render(
      <SessionListView
        sessions={mockSessions}
        isLoading={false}
        isFetchingNextPage={false}
        error={null}
        hasNextPage={false}
        loadMore={mockLoadMore}
        onSelectSession={mockOnSelectSession}
        {...filterProps}
      />
    );

    expect(screen.getByText("Session 1")).toBeInTheDocument();
    expect(screen.getByText("Session 2")).toBeInTheDocument();
    expect(screen.getByText("Analyze Intelligence")).toBeInTheDocument();
  });

  it("shows empty state when there are no sessions", () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const filterProps = createDefaultFilterProps();

    render(
      <SessionListView
        sessions={[]}
        isLoading={false}
        isFetchingNextPage={false}
        error={null}
        hasNextPage={false}
        loadMore={mockLoadMore}
        onSelectSession={mockOnSelectSession}
        {...filterProps}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true and there are no sessions", () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const filterProps = createDefaultFilterProps();

    render(
      <SessionListView
        sessions={[]}
        isLoading={true}
        isFetchingNextPage={false}
        error={null}
        hasNextPage={false}
        loadMore={mockLoadMore}
        onSelectSession={mockOnSelectSession}
        {...filterProps}
      />
    );

    const loader = screen.getByRole("img", { hidden: true });
    expect(loader).toHaveClass("animate-spin");
  });

  it("shows error state when there is an error", () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const filterProps = createDefaultFilterProps();

    render(
      <SessionListView
        sessions={[]}
        isLoading={false}
        isFetchingNextPage={false}
        error={new Error("Test error")}
        hasNextPage={false}
        loadMore={mockLoadMore}
        onSelectSession={mockOnSelectSession}
        {...filterProps}
      />
    );

    expect(screen.getByText("Error Loading Sessions")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("shows no matching sessions state when there are no results for a search", () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const filterProps = { 
      ...createDefaultFilterProps(),
      searchTerm: "nonexistent" 
    };

    render(
      <SessionListView
        sessions={[]}
        isLoading={false}
        isFetchingNextPage={false}
        error={null}
        hasNextPage={false}
        loadMore={mockLoadMore}
        onSelectSession={mockOnSelectSession}
        {...filterProps}
      />
    );

    expect(screen.getByText("No Matching Sessions")).toBeInTheDocument();
  });
});
