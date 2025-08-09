
import React from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface LoadingFallbackProps {
  message?: string;
  showNetworkStatus?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading...", 
  showNetworkStatus = true 
}) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  return (
    <div className="flex justify-center items-center h-screen bg-background-light">
      <div className="text-center space-y-4">
        <img 
          src="/lovable-uploads/0da40708-6587-46e8-883e-15310c301556.png" 
          alt="sideby logo" 
          className="h-12 w-auto mx-auto min-w-[76px] opacity-60"
        />
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600">{message}</p>
        
        {showNetworkStatus && !isOnline && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm mx-auto">
            <p className="text-red-700 text-sm">
              No internet connection. Please check your network and try again.
            </p>
          </div>
        )}
        
        {showNetworkStatus && isOnline && isSlowConnection && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-sm mx-auto">
            <p className="text-yellow-700 text-sm">
              Slow connection detected. Loading may take longer than usual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
