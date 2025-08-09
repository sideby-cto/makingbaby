
import React from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { Users, Book, MessageSquare } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SessionOverviewProps {
  session: UpduoSession;
}

export const SessionOverview = ({ session }: SessionOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Participants section */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-base font-medium">Participants</h3>
        </div>
        
        <div className="space-y-2">
          {session.users.map(user => (
            <div 
              key={user.id} 
              className="flex items-center gap-2 p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <div className="bg-primary/10 text-primary font-semibold h-8 w-8 rounded-full flex items-center justify-center text-sm">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">Participant</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Topics section */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Book className="h-4 w-4 text-primary" />
          <h3 className="text-base font-medium">Learning Topics</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {session.knowledgeNodes.map(node => (
            <TooltipProvider key={node.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <Book className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium">{node.name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Learning topic</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
      
      {/* Summary section */}
      <div className="bg-white rounded-lg border shadow-sm p-4 md:col-span-2">
        <h3 className="text-base font-medium mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Session Overview
        </h3>
        <p className="text-sm text-muted-foreground">
          This session involved discussions on {session.knowledgeNodes.map(node => node.name).join(', ')}.
          {session.type === "PAIR" 
            ? " Participants engaged in peer learning to enhance their understanding."
            : " This was a reflection session to deepen understanding of the topics."
          }
        </p>
      </div>
    </div>
  );
};
