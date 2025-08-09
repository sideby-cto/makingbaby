
import React from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, MessageSquare, Brain, TrendingUp } from "lucide-react";
import { SessionOverview } from "./SessionOverview";
import { SessionTranscript } from "./SessionTranscript";
import { SessionEnhancedAnalysis } from "./SessionEnhancedAnalysis";
import { SessionSuccessStories } from "./SessionSuccessStories";

interface SessionTabsProps {
  session: UpduoSession;
  hasTranscript: boolean;
}

export const SessionTabs = ({ session, hasTranscript }: SessionTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full flex-1 overflow-hidden flex flex-col">
      <TabsList className="mb-4 bg-gradient-to-r from-brand-tertiary/30 to-brand-secondary/30 border-2 border-brand-primary/20 shadow-sm">
        <TabsTrigger value="overview" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-brand-primary">
          <FileText className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        {hasTranscript && (
          <TabsTrigger value="transcript" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-brand-primary">
            <MessageSquare className="h-4 w-4" />
            <span>Transcript</span>
          </TabsTrigger>
        )}
        {hasTranscript && (
          <TabsTrigger value="enhanced-analysis" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-brand-primary">
            <Brain className="h-4 w-4" />
            <span>Enhanced Analysis</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="success-stories" className="flex items-center gap-2 font-bold data-[state=active]:bg-white data-[state=active]:text-brand-primary">
          <TrendingUp className="h-4 w-4" />
          <span>Success Stories</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="flex-1 overflow-auto m-0 pt-0">
        <SessionOverview session={session} />
      </TabsContent>
      
      {hasTranscript && (
        <TabsContent value="transcript" className="flex-1 overflow-auto m-0 pt-0">
          <SessionTranscript session={session} />
        </TabsContent>
      )}
      
      {hasTranscript && (
        <TabsContent value="enhanced-analysis" className="flex-1 overflow-auto m-0 pt-0">
          <SessionEnhancedAnalysis session={session} />
        </TabsContent>
      )}
      
      <TabsContent value="success-stories" className="flex-1 overflow-auto m-0 pt-0">
        <SessionSuccessStories session={session} />
      </TabsContent>
    </Tabs>
  );
};
