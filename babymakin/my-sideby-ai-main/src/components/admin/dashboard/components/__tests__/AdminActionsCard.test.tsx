
import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminActionsCard } from "../AdminActionsCard";
import { BrowserRouter } from "react-router-dom";
import { UserTool } from "@/hooks/useUserTools";

describe("AdminActionsCard", () => {
  it("renders with zero sponsorships when userTools is empty", () => {
    render(
      <BrowserRouter>
        <AdminActionsCard userTools={[]} />
      </BrowserRouter>
    );

    expect(screen.getByText("Tool Sponsorships")).toBeInTheDocument();
    expect(screen.getByText("No tool sponsorships yet")).toBeInTheDocument();
  });

  it("displays correct counts when userTools has data", () => {
    const mockUserTools = [
      { 
        id: "1", 
        name: "Tool 1", 
        description: "Description 1", 
        url: "https://example.com/tool1",
        user_id: "user1",
        assigned_by: "admin",
        assigned_at: "2023-01-01",
        expires_at: "2024-01-01",
        status: "active",
        created_at: "2023-01-01",
        updated_at: "2023-01-01"
      },
      { 
        id: "2", 
        name: "Tool 2", 
        description: "Description 2", 
        url: "https://example.com/tool2",
        user_id: "user1",
        assigned_by: "admin",
        assigned_at: "2023-01-01",
        expires_at: "2024-01-01",
        status: "active",
        created_at: "2023-01-01",
        updated_at: "2023-01-01"
      },
      { 
        id: "3", 
        name: "Tool 1", 
        description: "Description 1", 
        url: "https://example.com/tool1",
        user_id: "user2",
        assigned_by: "admin",
        assigned_at: "2023-01-01",
        expires_at: "2024-01-01",
        status: "active",
        created_at: "2023-01-01",
        updated_at: "2023-01-01"
      }
    ] as UserTool[];

    render(
      <BrowserRouter>
        <AdminActionsCard userTools={mockUserTools} />
      </BrowserRouter>
    );

    expect(screen.getByText("3 total sponsorships across 2 tools")).toBeInTheDocument();
  });
});
