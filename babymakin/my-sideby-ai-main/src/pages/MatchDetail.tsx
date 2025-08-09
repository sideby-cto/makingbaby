
import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SchedulingChatContainer } from "@/components/dashboard/scheduling/containers/SchedulingChatContainer";

export default function MatchDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, supabaseUser } = useAuth();

  // Handle test match ID or missing match ID
  if (!matchId || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Match not found</h1>
          <p className="text-muted-foreground">The requested match could not be found.</p>
        </div>
      </div>
    );
  }

  // Create a mock match object for test scenarios
  const mockMatch = {
    id: matchId,
    user1_id: user.id,
    user2_id: "mock-partner-id",
    status: "active",
    created_at: new Date().toISOString(),
    user1: {
      id: user.id,
      first_name: supabaseUser?.user_metadata?.first_name || "You",
      last_name: supabaseUser?.user_metadata?.last_name || "",
      avatar_url: supabaseUser?.user_metadata?.avatar_url || null,
    },
    user2: {
      id: "mock-partner-id",
      first_name: "Test",
      last_name: "Partner",
      avatar_url: null,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-6">
        <div className="bg-background sm:bg-card sm:rounded-lg sm:shadow-sm sm:border h-screen sm:h-[calc(100vh-8rem)]">
          <SchedulingChatContainer 
            match={mockMatch} 
            userId={user.id} 
          />
        </div>
      </div>
    </div>
  );
}
