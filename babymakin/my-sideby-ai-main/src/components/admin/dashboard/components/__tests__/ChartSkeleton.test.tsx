
import React from "react";
import { render, screen } from "@testing-library/react";
import { ChartSkeleton } from "../ChartSkeleton";

describe("ChartSkeleton", () => {
  it("renders skeleton elements", () => {
    render(<ChartSkeleton />);
    
    // Check for the presence of skeleton elements
    const skeletonElements = screen.getAllByRole("status");
    expect(skeletonElements.length).toBe(2); // Should have 2 skeleton elements
  });

  it("is wrapped in a Card component", () => {
    render(<ChartSkeleton />);
    
    // Check if it's wrapped in a card with padding
    const cardElement = screen.getByTestId("chart-skeleton-card");
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass("p-6");
  });
});
