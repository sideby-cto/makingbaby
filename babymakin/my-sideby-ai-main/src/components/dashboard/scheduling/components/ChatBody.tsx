
import React from 'react';
import { useBetaStatus } from '@/hooks/useBetaStatus';

interface ChatBodyProps {
  children: React.ReactNode;
}

export const ChatBody: React.FC<ChatBodyProps> = ({ children }) => {
  const { isBetaUser, loading, pacingLevel, userCreatedAt } = useBetaStatus();
  
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
      {children}
    </div>
  );
};
