
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { SessionDetailsCell } from "./table/SessionDetailsCell";
import { ParticipantsCell } from "./table/ParticipantsCell";
import { SessionType } from "./table/SessionType";
import { TranscriptStatus } from "./table/TranscriptStatus";
import { ViewDetailsButton } from "./table/ViewDetailsButton";
import { SuccessStoriesButton } from "./components/SuccessStoriesButton";
import { useWelcomeSessionAnalysis } from "./hooks/useWelcomeSessionAnalysis";

interface SessionTableRowProps {
  session: UpduoSession;
  isSelected: boolean;
  onSelect: (sessionId: string, selected: boolean) => void;
  onViewDetails: (session: UpduoSession) => void;
}

export const SessionTableRow = ({
  session,
  isSelected,
  onSelect,
  onViewDetails
}: SessionTableRowProps) => {
  const { analyzeWelcomeSession, isWelcomeSession } = useWelcomeSessionAnalysis();
  const durationInMinutes = Math.floor(session.duration / 60);
  
  const handleCheckboxChange = async (checked: boolean) => {
    onSelect(session.id, checked);
    
    // If this is a welcome session and it's being checked, analyze it
    if (checked && session.users[0] && isWelcomeSession(session)) {
      await analyzeWelcomeSession(session, session.users[0].id);
    }
  };

  const sessionTitle = session.knowledgeNodes && session.knowledgeNodes.length > 0 
    ? session.knowledgeNodes[0]?.name 
    : "Unnamed session";

  const hasTranscript = session.transcriptContents && session.transcriptContents.length > 0;
  
  return (
    <tr 
      className={`border-b border-brand-primary/10 transition-colors hover:bg-brand-tertiary/20 ${isSelected ? 'bg-brand-secondary/20' : ''}`} 
      data-state={isSelected ? 'selected' : undefined}
    >
      <td className="p-3 pl-4">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Select session ${session.id}`}
          className="border-2 border-brand-primary/40"
        />
      </td>
      <td className="p-3">
        <SessionDetailsCell title={sessionTitle} createdAt={session.createdAt} />
      </td>
      <td className="p-3">
        <ParticipantsCell users={session.users} />
      </td>
      <td className="p-3">
        <SessionType type={session.type} />
      </td>
      <td className="p-3 font-medium text-foreground">
        {durationInMinutes} min
      </td>
      <td className="p-3">
        <TranscriptStatus hasTranscript={hasTranscript} />
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center gap-2 justify-end">
          <SuccessStoriesButton 
            session={session}
            variant="outline"
            size="sm"
          />
          <ViewDetailsButton onClick={() => onViewDetails(session)} />
        </div>
      </td>
    </tr>
  );
};
