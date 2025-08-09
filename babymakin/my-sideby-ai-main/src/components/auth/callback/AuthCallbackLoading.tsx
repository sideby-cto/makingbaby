
import React from "react";

interface AuthCallbackLoadingProps {
  status: string;
}

export const AuthCallbackLoading: React.FC<AuthCallbackLoadingProps> = ({ status }) => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center p-4 max-w-md w-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg mb-2">{status}</p>
        <p className="text-xs text-gray-500">URL: {window.location.href}</p>
      </div>
    </div>
  );
};
