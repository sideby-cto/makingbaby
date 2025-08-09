
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, UsersThree, GraduationCap, Bug, Users } from "@phosphor-icons/react";

interface AdminTabNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminTabNav = ({ activeTab, setActiveTab }: AdminTabNavProps) => {
  // Ensure we have a valid tab selected
  React.useEffect(() => {
    if (!activeTab) {
      setActiveTab("ideas");
    }
  }, [activeTab, setActiveTab]);

  return (
    <TabsList className="grid grid-cols-5 w-full max-w-3xl bg-semantic-surface border border-semantic-border rounded-xl p-1">
      <TabsTrigger 
        value="ideas" 
        onClick={() => setActiveTab("ideas")}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-body-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-semantic-text-primary data-[state=active]:shadow-sm text-semantic-text-secondary hover:text-semantic-text-primary"
      >
        <Lightbulb size={18} weight="regular" />
        Ideas
      </TabsTrigger>
      <TabsTrigger 
        value="matches" 
        onClick={() => setActiveTab("matches")}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-body-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-semantic-text-primary data-[state=active]:shadow-sm text-semantic-text-secondary hover:text-semantic-text-primary"
      >
        <UsersThree size={18} weight="regular" />
        Matches
      </TabsTrigger>
      <TabsTrigger 
        value="learning" 
        onClick={() => setActiveTab("learning")}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-body-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-semantic-text-primary data-[state=active]:shadow-sm text-semantic-text-secondary hover:text-semantic-text-primary"
      >
        <GraduationCap size={18} weight="regular" />
        Learning
      </TabsTrigger>
      <TabsTrigger 
        value="upduo" 
        onClick={() => setActiveTab("upduo")}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-body-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-semantic-text-primary data-[state=active]:shadow-sm text-semantic-text-secondary hover:text-semantic-text-primary"
      >
        <Users size={18} weight="regular" />
        Upduo
      </TabsTrigger>
      <TabsTrigger 
        value="diagnostics" 
        onClick={() => setActiveTab("diagnostics")}
        className="flex items-center gap-2 px-4 py-3 rounded-lg text-body-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-semantic-text-primary data-[state=active]:shadow-sm text-semantic-text-secondary hover:text-semantic-text-primary"
      >
        <Bug size={18} weight="regular" />
        Diagnostics
      </TabsTrigger>
    </TabsList>
  );
};
