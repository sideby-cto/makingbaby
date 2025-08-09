
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationInvestigationTool } from "./NotificationInvestigationTool";
import { NotificationDebugView } from "./NotificationDebugView";

export function NotificationInvestigation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification System Investigation</h2>
        <p className="text-muted-foreground">
          Investigate and debug email notification issues in the user journey system.
        </p>
      </div>

      <Tabs defaultValue="investigation" className="w-full">
        <TabsList>
          <TabsTrigger value="investigation">Investigation Tool</TabsTrigger>
          <TabsTrigger value="debug">Debug Console</TabsTrigger>
        </TabsList>

        <TabsContent value="investigation">
          <NotificationInvestigationTool />
        </TabsContent>

        <TabsContent value="debug">
          <NotificationDebugView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
