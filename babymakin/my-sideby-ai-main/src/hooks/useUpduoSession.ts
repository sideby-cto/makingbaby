import { useUpduoSessionContext } from '@/contexts/UpduoSessionContext';

export type SessionMode = 'embedded' | 'fullscreen' | 'dialog';
export type SessionType = 'reflection' | 'conversation' | 'planning';

interface UseUpduoSessionProps {
  defaultMode?: SessionMode;
  defaultSessionType?: SessionType;
  communityCode?: string;
}

export const useUpduoSession = ({
  defaultMode = 'embedded',
  defaultSessionType = 'reflection',
  communityCode = 'washington'
}: UseUpduoSessionProps = {}) => {
  const context = useUpduoSessionContext();
  
  // Return the context values directly, maintaining the same interface
  return {
    // State
    isSessionActive: context.isSessionActive,
    isLoading: context.isLoading,
    sessionMode: context.sessionMode,
    sessionType: context.sessionType,
    error: context.error,
    
    // Actions
    startSession: context.startSession,
    endSession: context.endSession,
    switchMode: context.switchMode,
    handleError: context.handleError,
    openExternalSession: context.openExternalSession,
    
    // Helpers
    isEmbedded: context.isEmbedded,
    isFullscreen: context.isFullscreen,
    isDialog: context.isDialog
  };
};