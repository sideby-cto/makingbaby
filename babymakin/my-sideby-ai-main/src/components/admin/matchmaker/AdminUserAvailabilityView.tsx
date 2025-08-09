
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvailabilityList } from "../availability/UserAvailabilityList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CalendarClock } from "lucide-react";

export const AdminUserAvailabilityView = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="list" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Member List</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <CalendarClock className="w-4 h-4" />
            <span>Calendar View</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Member Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <UserAvailabilityList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-gray-500">
                <CalendarClock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-lg font-medium text-gray-700 mb-1">Calendar View Coming Soon</p>
                <p>This feature is currently in development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
