import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEngagementTracking } from './useEngagementTracking';

interface SessionCompletionEvent {
  type: 'session_completed';
  sessionId: string;
  isFirstReflection?: boolean;
  qualityScore?: number;
}

interface UseUpduoSessionEventsProps {
  onSessionCompleted?: (event: SessionCompletionEvent) => void;
  onFirstReflectionCompleted?: () => void;
}

export const useUpduoSessionEvents = ({ 
  onSessionCompleted, 
  onFirstReflectionCompleted 
}: UseUpduoSessionEventsProps = {}) => {
  const [lastCompletedSession, setLastCompletedSession] = useState<string | null>(null);
  const { user } = useAuth();
  const { trackUpduoSession } = useEngagementTracking();

  useEffect(() => {
    // Listen for messages from the Upduo iframe
    const handleMessage = async (event: MessageEvent) => {
      // Only accept messages from Upduo domains
      if (!event.origin.includes('upduo.com')) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'session_completed') {
          console.log('Received session completion event:', data);
          
          const sessionEvent: SessionCompletionEvent = {
            type: 'session_completed',
            sessionId: data.sessionId || data.conversation_id,
            isFirstReflection: data.isFirstReflection,
            qualityScore: data.qualityScore
          };

          setLastCompletedSession(sessionEvent.sessionId);
          
          // Track the session completion as an engagement
          if (user?.id) {
            await trackUpduoSession({
              sessionId: sessionEvent.sessionId,
              qualityScore: sessionEvent.qualityScore,
              isFirstReflection: sessionEvent.isFirstReflection
            });
          }
          
          // Call the session completed callback
          onSessionCompleted?.(sessionEvent);

          // If this is a first reflection completion, call the specific callback
          if (sessionEvent.isFirstReflection) {
            onFirstReflectionCompleted?.();
          }
        }
      } catch (error) {
        console.error('Error parsing session event:', error);
      }
    };

    // Add the event listener
    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSessionCompleted, onFirstReflectionCompleted, user?.id, trackUpduoSession]);

  // Simulate session completion for testing (can be removed in production)
  const simulateSessionCompletion = (isFirstReflection = false) => {
    const mockEvent: SessionCompletionEvent = {
      type: 'session_completed',
      sessionId: `sim-${Date.now()}`,
      isFirstReflection,
      qualityScore: isFirstReflection ? 85 : 90
    };

    onSessionCompleted?.(mockEvent);
    
    if (isFirstReflection) {
      onFirstReflectionCompleted?.();
    }
  };

  return {
    lastCompletedSession,
    simulateSessionCompletion
  };
};