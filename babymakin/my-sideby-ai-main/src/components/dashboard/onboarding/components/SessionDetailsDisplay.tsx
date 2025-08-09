import React from 'react';
import { Clock, Users, Calendar } from 'lucide-react';

interface SessionDetailsDisplayProps {
  sessionData?: {
    upduo_session_id?: string;
    upduo_session_name?: string;
    participants?: number;
    duration?: string;
    scheduled_time?: string;
  };
}

export const SessionDetailsDisplay: React.FC<SessionDetailsDisplayProps> = ({ sessionData }) => {
  if (!sessionData) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">Session Details</span>
      </div>
      
      <div className="space-y-2 text-sm">
        {sessionData.upduo_session_name && (
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-medium">Name:</span>
            <span className="text-blue-800">{sessionData.upduo_session_name}</span>
          </div>
        )}
        
        {sessionData.participants && (
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700 font-medium">Participants:</span>
            <span className="text-blue-800">{sessionData.participants}</span>
          </div>
        )}
        
        {sessionData.duration && (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700 font-medium">Duration:</span>
            <span className="text-blue-800">{sessionData.duration}</span>
          </div>
        )}
        
        {sessionData.scheduled_time && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700 font-medium">Scheduled:</span>
            <span className="text-blue-800">{sessionData.scheduled_time}</span>
          </div>
        )}
      </div>
    </div>
  );
};