import { supabase } from "@/integrations/supabase/client";

interface ConnectionState {
  isConnected: boolean;
  lastConnectedAt?: Date;
  reconnectAttempts: number;
  errors: string[];
  channels: Map<string, any>;
}

class WebSocketResilienceService {
  private state: ConnectionState = {
    isConnected: false,
    reconnectAttempts: 0,
    errors: [],
    channels: new Map()
  };

  private maxReconnectAttempts = 10;
  private baseDelay = 1000; // 1 second
  private maxDelay = 30000; // 30 seconds
  private listeners: ((state: ConnectionState) => void)[] = [];

  constructor() {
    this.monitorConnection();
    this.setupErrorHandling();
  }

  private monitorConnection() {
    const checkInterval = setInterval(() => {
      const realtime = (supabase as any).realtime;
      const isConnected = realtime?.isConnected() || false;
      
      if (isConnected !== this.state.isConnected) {
        this.state = {
          ...this.state,
          isConnected,
          lastConnectedAt: isConnected ? new Date() : this.state.lastConnectedAt
        };
        
        if (isConnected) {
          console.log("WebSocket reconnected successfully");
          this.state.reconnectAttempts = 0;
          this.state.errors = [];
        }
        
        this.notifyListeners();
      }
    }, 5000);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => clearInterval(checkInterval));
  }

  private setupErrorHandling() {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (this.isWebSocketError(message)) {
        this.handleWebSocketError(message);
      }
      
      originalError.apply(console, args);
    };
  }

  private isWebSocketError(message: string): boolean {
    const wsErrorKeywords = [
      'CHANNEL_ERROR',
      'websocket',
      'connection',
      'TIMED_OUT',
      'realtime',
      'subscription'
    ];
    
    return wsErrorKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private handleWebSocketError(error: string) {
    this.state.errors.push(error);
    
    // Keep only last 10 errors
    if (this.state.errors.length > 10) {
      this.state.errors = this.state.errors.slice(-10);
    }
    
    this.notifyListeners();
    
    // Attempt reconnection if we haven't exceeded max attempts
    if (this.state.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnection();
    }
  }

  private async attemptReconnection() {
    this.state.reconnectAttempts++;
    
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.state.reconnectAttempts - 1),
      this.maxDelay
    );
    
    console.log(`Attempting WebSocket reconnection ${this.state.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        const realtime = (supabase as any).realtime;
        
        // Disconnect and reconnect
        if (realtime) {
          realtime.disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000));
          realtime.connect();
        }
        
        this.notifyListeners();
      } catch (err) {
        console.error("Reconnection attempt failed:", err);
        this.handleWebSocketError(`Reconnection failed: ${err}`);
      }
    }, delay);
  }

  public getState(): ConnectionState {
    return { ...this.state };
  }

  public subscribe(listener: (state: ConnectionState) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (err) {
        console.error("Error in WebSocket state listener:", err);
      }
    });
  }

  public forceReconnect() {
    console.log("Forcing WebSocket reconnection");
    this.state.reconnectAttempts = 0;
    this.attemptReconnection();
  }

  public reset() {
    this.state = {
      isConnected: false,
      reconnectAttempts: 0,
      errors: [],
      channels: new Map()
    };
    this.notifyListeners();
  }
}

export const webSocketResilience = new WebSocketResilienceService();
