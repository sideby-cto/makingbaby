
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { shouldRestrictAccess, isBypassPath } from '@/utils/permissions/domainAccess';
import { PasswordPrompt } from '@/components/auth/PasswordPrompt';

interface RestrictedAccessProps {
  children: React.ReactNode;
}

export const RestrictedAccess = ({ children }: RestrictedAccessProps) => {
  const { loading, error } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [checkFailed, setCheckFailed] = useState(false);
  
  useEffect(() => {
    // Check if access should be restricted
    try {
      const shouldRestrict = shouldRestrictAccess();
      const isBypassed = isBypassPath(location.pathname);
      
      setIsAllowed(!shouldRestrict || isBypassed);
    } catch (err) {
      console.error("Error checking access restrictions:", err);
      // Default to allowing access if the check fails
      setIsAllowed(true);
      setCheckFailed(true);
    } finally {
      setIsChecking(false);
    }
  }, [location.pathname]);
  
  // In case of auth error, log but don't block access
  useEffect(() => {
    if (error) {
      console.warn("Auth error in RestrictedAccess:", error);
      // We still allow access, but log the error
    }
  }, [error]);
  
  // Add a recovery mechanism for stuck loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading state stuck for 5 seconds, forcing continue");
        setIsChecking(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [loading]);

  // If still checking, show loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If there was a check failure, log and allow access but show a subtle warning
  if (checkFailed) {
    console.warn("Access restriction check failed, defaulting to allowed access");
    // The warning is only visible in the console, not to users
  }

  // If access is allowed, render the children
  if (isAllowed) {
    return <>{children}</>;
  }

  // Otherwise, show the password prompt
  return <PasswordPrompt onAuthenticated={() => setIsAllowed(true)} />;
};
