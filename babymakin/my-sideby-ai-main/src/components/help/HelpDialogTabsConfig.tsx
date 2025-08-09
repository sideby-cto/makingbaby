
import React, { useMemo } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bug, Mail, ListChecks, Lightbulb } from "lucide-react";
import { HelpType } from "./types";

interface HelpDialogTabsConfigProps {
  type: HelpType;
  onTypeChange: (value: string) => void;
}

export const HelpDialogTabsConfig: React.FC<HelpDialogTabsConfigProps> = ({ 
  type, 
  onTypeChange 
}) => {
  // Memoize tab configuration with improved branding
  const tabConfig = useMemo(() => [
    { value: "bug", icon: Bug, label: "Bug Report", color: "text-red-600" },
    { value: "contact", icon: Mail, label: "Contact", color: "text-blue-600" },
    { value: "feature-request", icon: Lightbulb, label: "Features", color: "text-sideby-orange-600" },
    { value: "faqs", icon: ListChecks, label: "Values", color: "text-sideby-teal-600" },
  ], []);

  return (
    <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-8 w-full bg-gray-50/80 p-1.5 h-auto gap-1 rounded-xl border border-gray-200/60">
      {tabConfig.map(({ value, icon: Icon, label, color }) => (
        <TabsTrigger 
          key={value}
          value={value} 
          className="flex flex-col lg:flex-row items-center gap-2 py-3 px-3 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-sideby-orange-600 data-[state=active]:shadow-lg data-[state=active]:shadow-sideby-orange-100 data-[state=active]:border data-[state=active]:border-sideby-orange-200 hover:bg-white/60"
        >
          <Icon className={`w-4 h-4 flex-shrink-0 ${value === type ? 'text-sideby-orange-600' : color}`} />
          <span className="text-center lg:text-left font-medium">{label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
