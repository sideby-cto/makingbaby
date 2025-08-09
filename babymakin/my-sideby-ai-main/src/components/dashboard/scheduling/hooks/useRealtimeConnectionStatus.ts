import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeConnectionStatus {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: string | null;
  reconnectAttempts: number;
}

export const useRealtimeConnectionStatus = () => {
  const [status, setStatus] = useState<RealtimeConnectionStatus>({
    isConnected: false,
    connectionState: 'connecting',
    lastError: null,
    reconnectAttempts: 0
  });
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // Start with 1 second

  useEffect(() => {
    // Monitor Supabase connection status
    const checkConnection = () => {
      try {
        // Create a simple channel to test connectivity
        const testChannel = supabase
          .channel('connection-test')
          .subscribe((status, err) => {
            console.log('Connection test status:', status);
            
            let shouldReconnect = false;
            let currentAttempts = 0;
            
            setStatus(prev => {
              currentAttempts = prev.reconnectAttempts;
              
              if (status === 'SUBSCRIBED') {
                return {
                  ...prev,
                  isConnected: true,
                  connectionState: 'connected',
                  lastError: null,
                  reconnectAttempts: 0
                };
              } else if (status === 'CHANNEL_ERROR') {
                shouldReconnect = prev.reconnectAttempts < maxReconnectAttempts;
                return {
                  ...prev,
                  isConnected: false,
                  connectionState: 'error',
                  lastError: err?.message || 'Connection error',
                  reconnectAttempts: prev.reconnectAttempts + 1
                };
              } else if (status === 'TIMED_OUT') {
                shouldReconnect = prev.reconnectAttempts < maxReconnectAttempts;
                return {
                  ...prev,
                  isConnected: false,
                  connectionState: 'disconnected',
                  lastError: 'Connection timed out',
                  reconnectAttempts: prev.reconnectAttempts + 1
                };
              }
              
              return prev;
            });
            
            // Auto-reconnect with exponential backoff
            if (shouldReconnect && (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')) {
              const delay = baseReconnectDelay * Math.pow(2, currentAttempts);
              console.log(`Scheduling reconnect attempt ${currentAttempts + 1} in ${delay}ms`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                console.log('Attempting to reconnect...');
                supabase.removeChannel(testChannel);
                checkConnection();
              }, delay);
            }
          });
        
        return () => {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          supabase.removeChannel(testChannel);
        };
      } catch (error) {
        console.error('Error setting up connection monitor:', error);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          connectionState: 'error',
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    // Start monitoring
    const cleanup = checkConnection();
    
    return cleanup;
  }, []);

  const forceReconnect = () => {
    console.log('Force reconnecting...');
    setStatus(prev => ({
      ...prev,
      connectionState: 'connecting',
      reconnectAttempts: 0
    }));
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  return {
    ...status,
    forceReconnect
  };
};