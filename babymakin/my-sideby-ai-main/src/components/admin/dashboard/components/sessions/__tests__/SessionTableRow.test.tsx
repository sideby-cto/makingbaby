
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionTableRow } from "../SessionTableRow";

// Mock format from date-fns
jest.mock("date-fns", () => ({
  format: jest.fn(() => "Jan 1, 2023"),
}));

describe("SessionTableRow Component", () => {
  const mockOnSelect = jest.fn();
  const mockOnViewDetails = jest.fn();
  
  const mockPairSession = {
    id: "pair-session",
    createdAt: Date.now(),
    duration: 1800, // 30 minutes in seconds
    type: "PAIR" as const,
    users: [
      { id: "user1", firstName: "John", lastName: "Doe" },
      { id: "user2", firstName: "Jane", lastName: "Smith" }
    ],
    knowledgeNodes: [
      { id: "node1", name: "Topic 1", tags: [] }
    ],
    transcriptContents: [
      { speaker: "John", text: "Hello", startTime: 0, endTime: 5 }
    ]
  };

  const mockSingleSession = {
    id: "single-session",
    createdAt: Date.now(),
    duration: 2700, // 45 minutes in seconds
    type: "SINGLE" as const,
    users: [
      { id: "user3", firstName: "Bob", lastName: "Johnson" }
    ],
    knowledgeNodes: [
      { id: "node2", name: "Topic 2", tags: [] }
    ],
    transcriptContents: []
  };

  const mockPeerLearningSession = {
    id: "peer-learning-session",
    createdAt: Date.now(),
    duration: 1800, // 30 minutes in seconds
    type: "peer-learning" as const,
    users: [
      { id: "user1", firstName: "John", lastName: "Doe" },
      { id: "user2", firstName: "Jane", lastName: "Smith" }
    ],
    knowledgeNodes: [
      { id: "node1", name: "Topic 1", tags: [] }
    ],
    transcriptContents: [
      { speaker: "John", text: "Hello", startTime: 0, endTime: 5 }
    ]
  };

  const mockReflectionSession = {
    id: "reflection-session",
    createdAt: Date.now(),
    duration: 2700, // 45 minutes in seconds
    type: "reflection" as const,
    users: [
      { id: "user3", firstName: "Bob", lastName: "Johnson" }
    ],
    knowledgeNodes: [
      { id: "node2", name: "Topic 2", tags: [] }
    ],
    transcriptContents: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the session row with correct date", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockPairSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Jan 1, 2023")).toBeInTheDocument();
  });

  it("renders the user names correctly", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockPairSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/John Doe, Jane Smith/i)).toBeInTheDocument();
  });

  it("renders the content names correctly", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockPairSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Topic 1")).toBeInTheDocument();
  });

  it("renders the correct session type badge for PAIR type", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockPairSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    const badge = screen.getByText("Learning");
    expect(badge).toHaveClass("bg-blue-50");
    expect(badge).toHaveClass("text-blue-700");
  });

  it("renders the correct session type badge for SINGLE type", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockSingleSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    const badge = screen.getByText("Reflection");
    expect(badge).toHaveClass("bg-purple-50");
    expect(badge).toHaveClass("text-purple-700");
  });

  it("renders Unknown users when user data is missing", () => {
    const sessionWithNoUsers = {
      ...mockPairSession,
      users: [],
      type: "PAIR" as const
    };

    render(
      <table>
        <tbody>
          <SessionTableRow
            session={sessionWithNoUsers}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Unknown users")).toBeInTheDocument();
  });

  it("renders 'Unnamed session' when content data is missing", () => {
    const sessionWithNoContent = {
      ...mockPairSession,
      knowledgeNodes: [],
      type: "PAIR" as const
    };

    render(
      <table>
        <tbody>
          <SessionTableRow
            session={sessionWithNoContent}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Unnamed session")).toBeInTheDocument();
  });

  it("shows Available and file-text icon when transcript is available", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockPairSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Available")).toBeInTheDocument();
    const transcriptContainer = screen.getByText("Available").closest('span');
    expect(transcriptContainer).toHaveClass("text-green-600");
  });

  it("shows Unavailable and file-x icon when transcript is not available", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockSingleSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    const noTranscriptContainer = screen.getByText("Unavailable").closest('span');
    expect(noTranscriptContainer).toHaveClass("text-gray-400");
  });

  it("calls onSelect with the session ID when checkbox is clicked", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockPairSession}
            isSelected={false}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockOnSelect).toHaveBeenCalledWith("pair-session", true);
  });

  it("applies selected styles when isSelected is true", () => {
    render(
      <table>
        <tbody>
          <SessionTableRow
            session={mockPairSession}
            isSelected={true}
            onSelect={mockOnSelect}
            onViewDetails={mockOnViewDetails}
          />
        </tbody>
      </table>
    );

    const row = screen.getByText("Jan 1, 2023").closest('tr');
    expect(row).toHaveClass('bg-muted');
    expect(row).toHaveAttribute('data-state', 'selected');
  });
});
