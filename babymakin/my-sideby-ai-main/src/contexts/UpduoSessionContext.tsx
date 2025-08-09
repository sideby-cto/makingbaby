import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { SessionMode, SessionType } from '@/hooks/useUpduoSession';

interface UpduoSessionState {
  isSessionActive: boolean;
  isLoading: boolean;
  sessionMode: SessionMode;
  sessionType: SessionType;
  error: string | null;
  communityCode: string;
  sessionStartTime: number | null;
  lastActiveTime: number | null;
}

interface UpduoSessionContextType extends UpduoSessionState {
  startSession: (mode?: SessionMode, type?: SessionType) => void;
  endSession: () => void;
  switchMode: (newMode: SessionMode) => void;
  handleError: (errorMessage: string) => void;
  openExternalSession: () => void;
  updateLastActiveTime: () => void;
  isEmbedded: boolean;
  isFullscreen: boolean;
  isDialog: boolean;
}

const defaultState: UpduoSessionState = {
  isSessionActive: false,
  isLoading: false,
  sessionMode: 'embedded',
  sessionType: 'reflection',
  error: null,
  communityCode: 'washington',
  sessionStartTime: null,
  lastActiveTime: null,
};

const UpduoSessionContext = createContext<UpduoSessionContextType | undefined>(undefined);

const STORAGE_KEY = 'sideby-upduo-session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const UpduoSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UpduoSessionState>(defaultState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedState: UpduoSessionState = JSON.parse(saved);
          const now = Date.now();
          
          // Check if session is still valid (not expired)
          if (savedState.isSessionActive && 
              savedState.lastActiveTime && 
              (now - savedState.lastActiveTime) < SESSION_TIMEOUT) {
            setState(savedState);
            lastActiveRef.current = now;
          } else {
            // Session expired, clear it
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading Upduo session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadSession();
  }, []);

  // Save session to localStorage whenever state changes
  useEffect(() => {
    if (state.isSessionActive) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  // Update last active time periodically
  useEffect(() => {
    if (state.isSessionActive) {
      intervalRef.current = setInterval(() => {
        updateLastActiveTime();
      }, 30000); // Update every 30 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isSessionActive]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isSessionActive) {
        updateLastActiveTime();
      }
    };

    const handleBeforeUnload = () => {
      if (state.isSessionActive) {
        updateLastActiveTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.isSessionActive]);

  // Handle page focus/blur for tab switching
  useEffect(() => {
    const handleFocus = () => {
      if (state.isSessionActive) {
        updateLastActiveTime();
      }
    };

    const handleBlur = () => {
      if (state.isSessionActive) {
        updateLastActiveTime();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [state.isSessionActive]);

  const updateLastActiveTime = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    setState(prev => ({ ...prev, lastActiveTime: now }));
  }, []);

  const startSession = useCallback((
    mode: SessionMode = state.sessionMode,
    type: SessionType = state.sessionType
  ) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      sessionMode: mode,
      sessionType: type,
      isSessionActive: true,
      sessionStartTime: now,
      lastActiveTime: now,
    }));
    
    // Simulate loading delay for embedded mode
    if (mode === 'embedded') {
      setTimeout(() => {
        setState(prev => ({ ...prev, isLoading: false }));
      }, 1500);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.sessionMode, state.sessionType]);

  const endSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSessionActive: false,
      isLoading: false,
      error: null,
      sessionStartTime: null,
      lastActiveTime: null,
    }));
  }, []);

  const switchMode = useCallback((newMode: SessionMode) => {
    setState(prev => ({ ...prev, sessionMode: newMode }));
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setState(prev => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
    }));
  }, []);

  const openExternalSession = useCallback(() => {
    const url = `https://web.upduo.com?communityCode=${encodeURIComponent(state.communityCode)}`;
    window.open(url, "_blank");
  }, [state.communityCode]);

  const value: UpduoSessionContextType = {
    ...state,
    startSession,
    endSession,
    switchMode,
    handleError,
    openExternalSession,
    updateLastActiveTime,
    isEmbedded: state.sessionMode === 'embedded',
    isFullscreen: state.sessionMode === 'fullscreen',
    isDialog: state.sessionMode === 'dialog',
  };

  return (
    <UpduoSessionContext.Provider value={value}>
      {children}
    </UpduoSessionContext.Provider>
  );
};

export const useUpduoSessionContext = () => {
  const context = useContext(UpduoSessionContext);
  if (context === undefined) {
    throw new Error('useUpduoSessionContext must be used within a UpduoSessionProvider');
  }
  return context;
};