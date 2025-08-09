
import React from 'react';
import { formatDistance } from 'date-fns';
import { Book, Calendar, User, Users } from 'lucide-react';
import type { UpduoTranscript } from '@/types/upduo';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface UpduoRecentSessionsProps {
  transcripts: UpduoTranscript[];
}

export const UpduoRecentSessions: React.FC<UpduoRecentSessionsProps> = ({ transcripts }) => {
  if (!transcripts || transcripts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent session data available</p>
      </div>
    );
  }

  // Take only the most recent 5 transcripts
  const recentTranscripts = transcripts.slice(0, 5);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Recent Learning Sessions</h3>
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {recentTranscripts.map((transcript) => {
            const metadata = transcript.metadata || {};
            const sessionTitle = metadata.session_title || 
                               metadata.knowledgeNodes?.[0]?.name || 
                               'Untitled Session';
            const timeAgo = formatDistance(
              new Date(transcript.created_at),
              new Date(),
              { addSuffix: true }
            );
            
            const sessionType = metadata.type || 'Unknown';
            const isReflection = sessionType === 'SINGLE' || 
                                sessionTitle.toLowerCase().includes('reflection') || 
                                sessionTitle.toLowerCase().includes('welcome');
            
            return (
              <Card key={transcript.id} className="p-4">
                <CardContent className="p-0 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-semibold">{sessionTitle}</h4>
                    <Badge variant={isReflection ? "outline" : "secondary"}>
                      {isReflection ? 'Reflection' : 'Peer Learning'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{timeAgo}</span>
                    </div>
                    
                    {transcript.profiles && transcript.profiles.length > 0 && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {transcript.profiles[0].first_name} {transcript.profiles[0].last_name || ''}
                        </span>
                      </div>
                    )}
                    
                    {metadata.partner && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>With {metadata.partner.firstName} {metadata.partner.lastName || ''}</span>
                      </div>
                    )}
                    
                    {metadata.session_topics && metadata.session_topics.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        <span>{metadata.session_topics.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
