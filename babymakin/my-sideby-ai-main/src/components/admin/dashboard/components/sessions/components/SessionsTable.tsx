
import React from "react";
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SessionTableRow } from "../SessionTableRow";

interface SessionsTableProps {
  sessions: UpduoSession[];
  selectedSessionIds: string[];
  onSelect: (sessionId: string, selected: boolean) => void;
  onViewDetails: (session: UpduoSession) => void;
}

export const SessionsTable = ({ 
  sessions, 
  selectedSessionIds, 
  onSelect, 
  onViewDetails 
}: SessionsTableProps) => {
  return (
    <div className="w-full overflow-hidden border-2 border-brand-primary/20 rounded-xl shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-brand-tertiary/30 to-brand-secondary/30">
          <TableRow className="border-brand-primary/20">
            <TableHead className="w-[50px] font-black text-foreground"></TableHead>
            <TableHead className="font-black text-foreground font-display">Session</TableHead>
            <TableHead className="font-black text-foreground font-display">Participants</TableHead>
            <TableHead className="font-black text-foreground font-display">Type</TableHead>
            <TableHead className="font-black text-foreground font-display">Duration</TableHead>
            <TableHead className="font-black text-foreground font-display">Transcript</TableHead>
            <TableHead className="text-right font-black text-foreground font-display w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map(session => (
            <SessionTableRow
              key={session.id}
              session={session}
              isSelected={selectedSessionIds.includes(session.id)}
              onSelect={onSelect}
              onViewDetails={onViewDetails}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
