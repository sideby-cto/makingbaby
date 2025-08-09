import { useState, useEffect } from "react";

interface SimpleConnectionStatus {
  isOnline: boolean;
  isRealtimeActive: boolean;
  connectionMode: 'hybrid' | 'polling-only' | 'offline';
}

export const useSimpleConnectionStatus = (isRealtimeActive: boolean) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const connectionMode: 'hybrid' | 'polling-only' | 'offline' = 
    !isOnline ? 'offline' :
    isRealtimeActive ? 'hybrid' : 'polling-only';

  return {
    isOnline,
    isRealtimeActive,
    connectionMode
  };
};