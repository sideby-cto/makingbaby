
import { useState } from "react";
import { UserList } from "./UserList";
import { AvailabilityDetail } from "./AvailabilityDetail";
import { useUserAvailabilityList } from "./hooks/useUserAvailabilityList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock } from "lucide-react";

export const UserAvailabilityList = () => {
  const { users, loading, selectedUserId, setSelectedUserId, refreshUsers } = useUserAvailabilityList();

  if (loading && users.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-3" />
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (users.length === 0 && !loading) {
    return (
      <Card className="p-6 text-center">
        <CardHeader>
          <CardTitle className="flex justify-center items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            User Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 bg-gray-50 rounded-lg">
            <CalendarClock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Availability Feature Disabled</h3>
            <p className="text-gray-500">
              The availability scheduling feature is currently under maintenance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <UserList 
          users={users}
          loading={loading}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          onRefresh={refreshUsers}
        />
      </div>
      
      <div className="lg:col-span-2">
        <AvailabilityDetail selectedUserId={selectedUserId} />
      </div>
    </div>
  );
};
