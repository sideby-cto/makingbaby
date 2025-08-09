import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
  effectiveType?: string;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      let isSlowConnection = false;
      let connectionType: string | undefined;
      let effectiveType: string | undefined;

      // Check for Network Information API
      const navigator_connection = (navigator as any).connection || 
                                  (navigator as any).mozConnection || 
                                  (navigator as any).webkitConnection;

      if (navigator_connection) {
        connectionType = navigator_connection.type;
        effectiveType = navigator_connection.effectiveType;
        
        // Consider 2g and slow-2g as slow connections
        isSlowConnection = effectiveType === '2g' || effectiveType === 'slow-2g';
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        connectionType,
        effectiveType,
      });
    };

    // Initial check
    updateNetworkStatus();

    // Event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Network Information API change listener
    const navigator_connection = (navigator as any).connection;
    if (navigator_connection) {
      navigator_connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (navigator_connection) {
        navigator_connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};