
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface ChatCompletedInfoProps {
  isAutoCompleted: boolean;
  matchDetails: {
    status?: string;
    completed_at?: string | null;
    completion_notes?: string | null;
    completed_by?: string | null;
    upduo_session_id?: string | null;
    upduo_session_name?: string | null;
  };
}

export const ChatCompletedInfo: React.FC<ChatCompletedInfoProps> = ({ 
  isAutoCompleted, 
  matchDetails 
}) => {
  const { completed_at, completion_notes, upduo_session_id, upduo_session_name } = matchDetails;
  
  if (!completed_at) return null;
  
  const completedDate = new Date(completed_at);
  const formattedDate = format(completedDate, "MMMM d, yyyy 'at' h:mm a");
  
  return (
    <Card className="m-3 bg-green-50 border-green-200">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-medium text-green-800">
            Match Completed
            {isAutoCompleted && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Auto-completed</span>}
          </h3>
        </div>
        
        <div className="flex items-center text-sm text-green-600 mb-2">
          <CalendarCheck className="h-4 w-4 mr-1" />
          Completed on {formattedDate}
        </div>
        
        {completion_notes && (
          <div className="mt-2 pt-2 border-t border-green-200 text-sm">
            <p className="font-medium text-green-800">Notes:</p>
            <p className="text-green-700">{completion_notes}</p>
          </div>
        )}
        
        {isAutoCompleted && upduo_session_id && (
          <div className="mt-2 pt-2 border-t border-green-200 text-sm">
            <p className="font-medium text-green-800">
              Completed via Upduo: {upduo_session_name || 'Session'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
