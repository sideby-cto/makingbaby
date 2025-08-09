import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkSupabaseConnection = async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      setSupabaseConnected(!error);
    } catch (err) {
      setSupabaseConnected(false);
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    // Check browser online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Supabase connection check
    checkSupabaseConnection();

    // Periodic connection checks
    const interval = setInterval(checkSupabaseConnection, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getConnectionStatus = () => {
    if (!isOnline) return { status: 'offline', color: 'destructive', icon: WifiOff };
    if (!supabaseConnected) return { status: 'degraded', color: 'secondary', icon: WifiOff };
    return { status: 'connected', color: 'default', icon: Wifi };
  };

  const { status, color, icon: Icon } = getConnectionStatus();

  if (status === 'connected') {
    return null; // Don't show anything when everything is working
  }

  return (
    <Alert className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>
            {status === 'offline' && 'You are currently offline'}
            {status === 'degraded' && 'Connection issues detected'}
          </span>
          <Badge variant={color as any} className="capitalize">
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkSupabaseConnection}
            className="h-6"
            aria-label="Refresh connection status"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};