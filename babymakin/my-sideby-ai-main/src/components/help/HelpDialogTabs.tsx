
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bug, Mail, ListChecks, Lock } from "lucide-react";
import { HelpType } from "./types";

interface HelpDialogTabsProps {
  type: HelpType;
  onTypeChange: (value: HelpType) => void;
}

export const HelpDialogTabs: React.FC<HelpDialogTabsProps> = ({ 
  type, 
  onTypeChange 
}) => {
  return (
    <Tabs 
      defaultValue="bug" 
      value={type} 
      onValueChange={(value) => onTypeChange(value as HelpType)} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-6 w-full bg-gray-100/80 p-1 h-auto">
        <TabsTrigger 
          value="bug" 
          className="flex items-center gap-1 py-3 px-1 data-[state=active]:bg-white data-[state=active]:text-[#FF5733] data-[state=active]:shadow-sm"
        >
          <Bug className="w-4 h-4" /> Report a bug
        </TabsTrigger>
        <TabsTrigger 
          value="contact"
          className="flex items-center gap-1 py-3 px-1 data-[state=active]:bg-white data-[state=active]:text-[#FF5733] data-[state=active]:shadow-sm"
        >
          <Mail className="w-4 h-4" /> Contact a human
        </TabsTrigger>
        <TabsTrigger 
          value="feature-request"
          className="flex items-center gap-1 py-3 px-1 data-[state=active]:bg-white data-[state=active]:text-[#FF5733] data-[state=active]:shadow-sm"
        >
          <Mail className="w-4 h-4" /> Feature request
        </TabsTrigger>
        <TabsTrigger 
          value="faqs"
          className="flex items-center gap-1 py-3 px-1 data-[state=active]:bg-white data-[state=active]:text-[#FF5733] data-[state=active]:shadow-sm"
        >
          <ListChecks className="w-4 h-4" /> Our Values
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
