import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Award } from "lucide-react";
interface ToolboxTabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
export const ToolboxTabNavigation = ({
  activeTab,
  setActiveTab
}: ToolboxTabNavigationProps) => {
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger 
        value="tools" 
        onClick={() => setActiveTab("tools")}
        className="flex items-center gap-2"
      >
        <Briefcase className="h-4 w-4" />
        Tools
      </TabsTrigger>
      <TabsTrigger 
        value="badges" 
        onClick={() => setActiveTab("badges")}
        className="flex items-center gap-2"
      >
        <Award className="h-4 w-4" />
        Badges
      </TabsTrigger>
    </TabsList>
  );
};