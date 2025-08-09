
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SponsorshipManagementCard } from "../SponsorshipManagementCard";
import { BrowserRouter } from "react-router-dom";

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

describe("SponsorshipManagementCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders with zero sponsorships when userTools is undefined", () => {
    render(
      <BrowserRouter>
        <SponsorshipManagementCard userTools={undefined} />
      </BrowserRouter>
    );
    
    expect(screen.getByText("Sponsorship Management")).toBeInTheDocument();
    expect(screen.getByText("Active Sponsorships")).toBeInTheDocument();
    expect(screen.getByText("Total Members with Tools")).toBeInTheDocument();
    
    // Check for zero counts
    const counts = screen.getAllByText("0");
    expect(counts.length).toBe(2);
  });

  it("displays correct counts when userTools has data", () => {
    const mockUserTools = [
      { id: 1, user_id: "user1", tool_id: "tool1" },
      { id: 2, user_id: "user1", tool_id: "tool2" },
      { id: 3, user_id: "user2", tool_id: "tool1" }
    ];
    
    render(
      <BrowserRouter>
        <SponsorshipManagementCard userTools={mockUserTools} />
      </BrowserRouter>
    );
    
    // Should show 3 active sponsorships
    expect(screen.getByText("3")).toBeInTheDocument();
    
    // Should show 2 unique users
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("navigates to sponsorships page when button is clicked", () => {
    render(
      <BrowserRouter>
        <SponsorshipManagementCard userTools={[]} />
      </BrowserRouter>
    );
    
    // Click the button
    fireEvent.click(screen.getByText("Give Tools"));
    
    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith("/admin/sponsorships");
  });
});
