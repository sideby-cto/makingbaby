
import React from 'react';
import { useBetaStatus } from '@/hooks/useBetaStatus';

interface ChatFooterProps {
  children: React.ReactNode;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({ children }) => {
  const { isBetaUser, loading, pacingLevel, userCreatedAt } = useBetaStatus();
  
  return (
    <div className="border-t p-4 bg-white">
      {children}
    </div>
  );
};
