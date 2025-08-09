
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RocketfuelCard } from "../RocketfuelCard";
import { BrowserRouter } from "react-router-dom";

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

describe("RocketfuelCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the Rocketfuel card with correct content", () => {
    render(
      <BrowserRouter>
        <RocketfuelCard />
      </BrowserRouter>
    );
    
    // Check for the title
    expect(screen.getByText("Rocketfuel")).toBeInTheDocument();
    
    // Check for the description text
    expect(screen.getByText(/Create meaningful connections between members/i)).toBeInTheDocument();
    
    // Check for the button
    expect(screen.getByText("Drive sideby")).toBeInTheDocument();
  });

  it("navigates to matchmaker page when button is clicked", () => {
    render(
      <BrowserRouter>
        <RocketfuelCard />
      </BrowserRouter>
    );
    
    // Click the button
    fireEvent.click(screen.getByText("Drive sideby"));
    
    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith("/admin/matchmaker");
  });
});
