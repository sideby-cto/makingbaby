import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, X } from 'lucide-react';
import { useUpduoSessionContext } from '@/contexts/UpduoSessionContext';
import { formatDistanceToNow } from 'date-fns';

export const SessionRecoveryIndicator: React.FC = () => {
  // Component disabled - no longer shows the session recovery popup
  return null;
};