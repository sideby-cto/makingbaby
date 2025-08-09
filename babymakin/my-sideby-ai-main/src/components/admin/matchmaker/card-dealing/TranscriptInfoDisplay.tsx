
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, Clock } from 'lucide-react';

interface TranscriptData {
  user1: {
    name: string;
    transcriptCount: number;
    recentTopics: string[];
  };
  user2: {
    name: string;
    transcriptCount: number;
    recentTopics: string[];
  };
}

interface TranscriptInfoDisplayProps {
  transcriptData: TranscriptData;
}

export const TranscriptInfoDisplay: React.FC<TranscriptInfoDisplayProps> = ({
  transcriptData
}) => {
  const { user1, user2 } = transcriptData;

  const renderUserTranscriptInfo = (user: typeof user1) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />
        <span className="font-medium">{user.name}</span>
        <Badge variant="outline" className="ml-auto">
          {user.transcriptCount} sessions
        </Badge>
      </div>
      
      {user.recentTopics.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Recent Topics
          </h5>
          <div className="flex flex-wrap gap-1">
            {user.recentTopics.slice(0, 4).map((topic, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {user.recentTopics.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{user.recentTopics.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {user.transcriptCount === 0 && (
        <p className="text-sm text-gray-500 italic">No reflection sessions yet</p>
      )}
    </div>
  );

  const totalSessions = user1.transcriptCount + user2.transcriptCount;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
          <Clock className="h-4 w-4" />
          Reflection Activity Overview
          <Badge variant="outline" className="ml-auto">
            {totalSessions} total sessions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderUserTranscriptInfo(user1)}
        <div className="border-t pt-3">
          {renderUserTranscriptInfo(user2)}
        </div>
        
        {totalSessions === 0 && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-600">
              Neither user has completed reflection sessions yet.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This match could help encourage reflection practice.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
