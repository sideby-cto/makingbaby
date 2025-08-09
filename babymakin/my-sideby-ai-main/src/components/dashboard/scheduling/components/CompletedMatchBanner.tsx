
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, CheckCircle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface CompletedMatchBannerProps {
  completedAt: string;
  partnerName: string;
  isAutoCompleted?: boolean;
  completionNotes?: string;
  upduoSessionId?: string;
  upduoSessionName?: string;
}

export const CompletedMatchBanner: React.FC<CompletedMatchBannerProps> = ({
  completedAt,
  partnerName,
  isAutoCompleted = false,
  completionNotes,
  upduoSessionId,
  upduoSessionName
}) => {
  return (
    <Card className="p-4 mb-4 bg-green-50 border-green-200">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h3 className="font-medium text-green-800">Match Completed</h3>
        {isAutoCompleted && (
          <Badge variant="outline" className="ml-auto bg-green-100 text-green-800 border-green-300">
            Auto-completed
          </Badge>
        )}
      </div>
      
      <p className="text-green-700 mb-2">
        Your session with <span className="font-semibold">{partnerName}</span> has been completed.
      </p>
      
      <div className="flex items-center text-sm text-green-600 mb-2">
        <CalendarCheck className="h-4 w-4 mr-1" />
        Completed on {format(new Date(completedAt), "MMMM d, yyyy 'at' h:mm a")}
      </div>
      
      {isAutoCompleted && upduoSessionId && (
        <div className="mt-2 pt-2 border-t border-green-200">
          <p className="text-sm font-medium text-green-800 mb-1">
            Completed via Upduo: {upduoSessionName || 'Session'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white text-green-700 border-green-300 hover:bg-green-50 flex items-center gap-1 text-xs"
            onClick={() => window.open(`https://web.upduo.com/session/${upduoSessionId}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
            View Upduo Transcript
          </Button>
        </div>
      )}
      
      {completionNotes && (
        <div className="mt-2 pt-2 border-t border-green-200">
          <p className="text-sm font-medium text-green-800">Notes:</p>
          <p className="text-sm text-green-700">{completionNotes}</p>
        </div>
      )}
    </Card>
  );
};
