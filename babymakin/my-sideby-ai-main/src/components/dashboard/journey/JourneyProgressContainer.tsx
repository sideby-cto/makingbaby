
import React from 'react';
import { AdaptiveJourneyView } from './AdaptiveJourneyView';
import { useAuth } from '@/hooks/useAuth';

export const JourneyProgressContainer: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <AdaptiveJourneyView 
      userId={user?.id}
      className="w-full"
    />
  );
};
