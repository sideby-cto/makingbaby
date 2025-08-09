import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export const PerformanceToastProvider = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Monitor page load performance
    const handleLoad = () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      if (loadTime > 10000) { // 10 seconds
        toast({
          title: "Slow Performance Detected",
          description: `Page took ${(loadTime / 1000).toFixed(1)}s to load. This may impact user experience.`,
          variant: "destructive",
        });
      }
    };

    // Monitor for WebSocket connection issues
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('CHANNEL_ERROR') || message.includes('websocket')) {
        toast({
          title: "Connection Issue",
          description: "WebSocket connection problems detected. Some features may not work properly.",
          variant: "destructive",
        });
      }
      originalError.apply(console, args);
    };

    // Monitor online/offline status
    const handleOnline = () => {
      toast({
        title: "Connection Restored",
        description: "You're back online!",
      });
    };

    const handleOffline = () => {
      toast({
        title: "Connection Lost",
        description: "You're currently offline. Some features may not work.",
        variant: "destructive",
      });
    };

    // Add event listeners
    window.addEventListener('load', handleLoad);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      console.error = originalError;
    };
  }, [toast]);

  return null; // This is a provider component, no UI
};