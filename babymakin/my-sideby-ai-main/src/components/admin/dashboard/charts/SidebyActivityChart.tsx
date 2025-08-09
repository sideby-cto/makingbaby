
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebyActivityLineChart } from "./SidebyActivityLineChart";
import { RecentActivityList } from "./RecentActivityList";

interface ActivityData {
  id: string;
  type: "match_created" | "match_completed" | "member_joined";
  created_at: string;
  metadata?: {
    user_name?: string;
    partner_name?: string;
  };
}

export const SidebyActivityChart = () => {
  const {
    data: activities,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sideby-activities"],
    queryFn: async () => {
      try {
        // Fetch matches created
        const { data: matchesCreated, error: matchesError } = await supabase
          .from("matches")
          .select(
            `
            id,
            created_at,
            user1:profiles!user1_id(first_name, last_name),
            user2:profiles!user2_id(first_name, last_name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(50);

        if (matchesError) throw matchesError;

        // Fetch matches completed
        const { data: matchesCompleted, error: completedError } = await supabase
          .from("matches")
          .select(
            `
            id,
            completed_at,
            user1:profiles!user1_id(first_name, last_name),
            user2:profiles!user2_id(first_name, last_name)
          `
          )
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(50);

        if (completedError) throw completedError;

        // Fetch new members (profiles created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: newMembers, error: membersError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, created_at")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(50);

        if (membersError) throw membersError;

        // Transform data into unified format
        const transformedData: ActivityData[] = [
          ...matchesCreated.map((match) => ({
            id: `match_created_${match.id}`,
            type: "match_created" as const,
            created_at: match.created_at,
            metadata: {
              user_name: `${match.user1?.first_name || ""} ${
                match.user1?.last_name?.[0] || ""
              }`,
              partner_name: `${match.user2?.first_name || ""} ${
                match.user2?.last_name?.[0] || ""
              }`,
            },
          })),
          ...matchesCompleted.map((match) => ({
            id: `match_completed_${match.id}`,
            type: "match_completed" as const,
            created_at: match.completed_at || "", // Ensure created_at is set from completed_at
            metadata: {
              user_name: `${match.user1?.first_name || ""} ${
                match.user1?.last_name?.[0] || ""
              }`,
              partner_name: `${match.user2?.first_name || ""} ${
                match.user2?.last_name?.[0] || ""
              }`,
            },
          })),
          ...newMembers.map((member) => ({
            id: `member_joined_${member.id}`,
            type: "member_joined" as const,
            created_at: member.created_at,
            metadata: {
              user_name: `${member.first_name || ""} ${
                member.last_name?.[0] || ""
              }`,
            },
          })),
        ];

        // Sort by date
        transformedData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return transformedData;
      } catch (err) {
        console.error("Error in SidebyActivityChart   :", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            sideby Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Error in SidebyActivityChart:", error);
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            sideby Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Error loading sideby activity data:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">sideby Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Matches made:{" "}
          {activities?.filter((a) => a.type === "match_created").length || 0} |
          Matches completed:{" "}
          {activities?.filter((a) => a.type === "match_completed").length || 0}{" "}
          | New members:{" "}
          {activities?.filter((a) => a.type === "member_joined").length || 0}
        </p>
      </CardHeader>
      <CardContent>
        {activities && (
          <>
            <SidebyActivityLineChart activities={activities} />
            <RecentActivityList activities={activities} />
          </>
        )}
      </CardContent>
    </Card>
  );
};
