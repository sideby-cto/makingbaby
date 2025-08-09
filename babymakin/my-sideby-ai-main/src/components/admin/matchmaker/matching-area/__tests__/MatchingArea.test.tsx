
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MatchingArea } from "../MatchingArea";
import { supabase } from "@/integrations/supabase/client";
import { act } from "react-dom/test-utils";

// Mock supabase
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
      }),
    },
  },
}));

// Mock useMatchHandler hook
jest.mock("@/hooks/useMatchHandler", () => ({
  useMatchHandler: ({ onMatchCreated }) => ({
    handleMatch: jest.fn().mockImplementation(() => {
      if (onMatchCreated) onMatchCreated();
      return Promise.resolve();
    }),
    isCreating: false,
    showMatchDialog: false,
    setShowMatchDialog: jest.fn(),
    selectedUsers: null,
    setSelectedUsers: jest.fn()
  }),
}));

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn((i: number) => ''),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock MatchingAreaContent to simplify testing
jest.mock("../MatchingAreaContent", () => ({
  MatchingAreaContent: jest.fn(({ onMatch }) => (
    <div data-testid="matching-area-content">
      <button 
        data-testid="create-match-button"
        onClick={() => onMatch && onMatch({id: "user1"} as any, {id: "user2"} as any, "Test description")}
      >
        Create Match
      </button>
    </div>
  )),
}));

// Mock ViewAsUser component
jest.mock("../../ViewAsUser", () => ({
  ViewAsUser: () => <div data-testid="view-as-user">View As User Component</div>
}));

describe("MatchingArea Component", () => {
  const mockOnMatch = jest.fn().mockResolvedValue(undefined);
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it("renders the component with tabs", async () => {
    await act(async () => {
      render(<MatchingArea onMatch={mockOnMatch} />);
    });

    expect(screen.getByText("Match Members")).toBeInTheDocument();
    expect(screen.getByText("Manual Match")).toBeInTheDocument();
    expect(screen.getByText("View As User")).toBeInTheDocument();
  });

  it("shows MatchingAreaContent when on the auto tab", async () => {
    await act(async () => {
      render(<MatchingArea onMatch={mockOnMatch} />);
    });

    expect(screen.getByTestId("matching-area-content")).toBeInTheDocument();
  });

  it("switches to ViewAsUser when clicking the impersonate tab", async () => {
    await act(async () => {
      render(<MatchingArea onMatch={mockOnMatch} />);
    });

    // Initially should show MatchingAreaContent
    expect(screen.getByTestId("matching-area-content")).toBeInTheDocument();
    
    // Click the ViewAsUser tab
    fireEvent.click(screen.getByText("View As User"));
    
    // Should now show the ViewAsUser component
    expect(screen.getByTestId("view-as-user")).toBeInTheDocument();
    expect(screen.queryByTestId("matching-area-content")).not.toBeInTheDocument();
  });

  it("calls onMatch when match is created", async () => {
    await act(async () => {
      render(<MatchingArea onMatch={mockOnMatch} />);
    });

    // Create a match
    const createButton = screen.getByTestId("create-match-button");
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(mockOnMatch).toHaveBeenCalled();
  });

  it("shows manual match tab content when clicking the manual tab", async () => {
    await act(async () => {
      render(<MatchingArea onMatch={mockOnMatch} />);
    });

    // Click the manual match tab
    fireEvent.click(screen.getByText("Manual Match"));
    
    // Check for manual match content
    expect(screen.getByText(/manual match functionality/i)).toBeInTheDocument();
  });
});
