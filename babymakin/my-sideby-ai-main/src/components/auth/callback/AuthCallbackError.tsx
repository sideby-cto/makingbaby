
import React from "react";
import { getBaseUrl } from "@/utils/auth/callbackUtils";

interface AuthCallbackErrorProps {
  error: string;
  debugInfo: any;
}

export const AuthCallbackError: React.FC<AuthCallbackErrorProps> = ({ 
  error, 
  debugInfo 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center p-4 text-red-500 bg-red-50 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
        <p className="mb-2">{error}</p>
        {debugInfo && (
          <div className="text-xs text-left bg-gray-100 p-2 rounded mt-4 overflow-auto max-h-40">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        <button 
          onClick={() => window.location.href = `${getBaseUrl()}/login`} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};
