
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SessionListView } from "../SessionListView";
import { useInView } from "react-intersection-observer";
import { createMockSessions, setupMocks, createTestProps, createDefaultFilterProps } from "./testUtils";

// Run setup
setupMocks();

describe("SessionListView Interaction Behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls loadMore when the load more element comes into view", async () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const mockSessions = createMockSessions();
    const filterProps = createDefaultFilterProps();
    
    // Set up the mock to simulate the loader coming into view
    (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: true });
    
    render(
      <SessionListView
        sessions={mockSessions}
        isLoading={false}
        isFetchingNextPage={false}
        error={null}
        hasNextPage={true}
        loadMore={mockLoadMore}
        onSelectSession={mockOnSelectSession}
        {...filterProps}
      />
    );

    await waitFor(() => {
      expect(mockLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onSelectSession when a session row is clicked", () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const mockSessions = createMockSessions();
    const filterProps = createDefaultFilterProps();

    (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });

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

    fireEvent.click(screen.getByTestId("session-row-1"));
    expect(mockOnSelectSession).toHaveBeenCalledWith(mockSessions[0]);
  });

  it("enables the analyze button when a session is selected", () => {
    const { mockLoadMore, mockOnSelectSession } = createTestProps();
    const mockSessions = createMockSessions();
    const filterProps = createDefaultFilterProps();

    (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });

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

    const analyzeButton = screen.getByText("Analyze Intelligence").closest('button');
    expect(analyzeButton).toBeDisabled();

    fireEvent.click(screen.getByTestId("session-row-1"));
    expect(analyzeButton).not.toBeDisabled();
  });
});
