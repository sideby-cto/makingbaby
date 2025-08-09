import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WebSocketHealth {
  connected: boolean;
  channelCount: number;
  errors: number;
  lastError?: string;
  reconnectAttempts: number;
}

export const useWebSocketMonitor = () => {
  const [health, setHealth] = useState<WebSocketHealth>({
    connected: false,
    channelCount: 0,
    errors: 0,
    reconnectAttempts: 0
  });

  useEffect(() => {
    let errorCount = 0;
    let reconnectCount = 0;

    // Monitor WebSocket status
    const checkConnection = () => {
      const realtime = (supabase as any).realtime;
      const isConnected = realtime?.isConnected() || false;
      const channels = realtime?.channels || new Map();
      
      setHealth(prev => ({
        ...prev,
        connected: isConnected,
        channelCount: channels.size
      }));
    };

    // Initial check
    checkConnection();

    // Monitor console errors for WebSocket issues
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('CHANNEL_ERROR') || 
          message.includes('websocket') || 
          message.includes('connection') ||
          message.includes('TIMED_OUT')) {
        
        errorCount++;
        
        setHealth(prev => ({
          ...prev,
          errors: errorCount,
          lastError: message
        }));

        // Auto-recovery attempt for persistent errors
        if (errorCount > 3 && errorCount % 5 === 0) {
          console.log("WebSocketMonitor: Attempting connection recovery");
          reconnectCount++;
          
          // Disconnect and reconnect
          try {
            (supabase as any).realtime?.disconnect();
            setTimeout(() => {
              (supabase as any).realtime?.connect();
              setHealth(prev => ({ ...prev, reconnectAttempts: reconnectCount }));
            }, 2000);
          } catch (err) {
            console.error("Recovery attempt failed:", err);
          }
        }
      }
      
      originalError.apply(console, args);
    };

    // Periodic health check
    const interval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(interval);
      console.error = originalError;
    };
  }, []);

  return { health };
};

export const WebSocketStatus = () => {
  const { health } = useWebSocketMonitor();

  if (health.errors === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm max-w-sm">
      <div className="font-semibold text-yellow-800">Connection Health</div>
      <div className="text-yellow-700">
        Status: {health.connected ? '🟢 Connected' : '🔴 Disconnected'}<br/>
        Channels: {health.channelCount}<br/>
        Errors: {health.errors}<br/>
        {health.reconnectAttempts > 0 && (
          <>Reconnects: {health.reconnectAttempts}<br/></>
        )}
        {health.lastError && (
          <div className="text-xs mt-1 truncate">
            Last: {health.lastError.substring(0, 50)}...
          </div>
        )}
      </div>
    </div>
  );
};