
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { LoadingFallback } from '@/components/LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  allowIncompleteOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminRequired = false,
  allowIncompleteOnboarding = false
}) => {
  const { user, loading: authLoading } = useAuth();
  const onboardingStatus = useOnboardingStatus();
  const location = useLocation();

  // Enhanced loading state management with better debugging
  const isLoading = authLoading || onboardingStatus.loading;
  
  console.log('[ProtectedRoute] Current state:', {
    path: location.pathname,
    authLoading,
    onboardingLoading: onboardingStatus.loading,
    hasUser: !!user,
    userId: user?.id,
    adminRequired,
    allowIncompleteOnboarding,
    onboardingStatus: {
      hasValuesAcknowledgment: onboardingStatus.hasValuesAcknowledgment,
      isComplete: onboardingStatus.isOnboardingComplete,
      nextStep: onboardingStatus.nextStep
    }
  });

  if (isLoading) {
    console.log('[ProtectedRoute] Still loading, showing loading fallback');
    return <LoadingFallback message="Checking authentication..." />;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check admin requirements
  if (adminRequired && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Skip onboarding checks for admin users with @sideby.ai email
  const isAdminUser = user.email && user.email.endsWith('@sideby.ai');
  
  // For non-admin users, enforce values acknowledgment
  if (!isAdminUser && !allowIncompleteOnboarding) {
    // Values acknowledgment is REQUIRED for all protected routes
    // Don't redirect to /values if we're already on /values (prevents infinite loop)
    if (!onboardingStatus.hasValuesAcknowledgment && location.pathname !== '/values') {
      console.log('[ProtectedRoute] Missing values acknowledgment, redirecting to /values');
      return <Navigate to="/values" replace />;
    }
  }
  
  // Enforce full onboarding completion unless explicitly allowed or for admin users
  if (!allowIncompleteOnboarding && !isAdminUser) {
    // Use the primary source of truth: if onboarding is complete, allow access
    if (onboardingStatus.isOnboardingComplete) {
      console.log('[ProtectedRoute] Onboarding complete, allowing access');
      return <>{children}</>;
    }
    
    // Check individual steps and redirect accordingly
    console.log('[ProtectedRoute] Onboarding incomplete, next step:', onboardingStatus.nextStep);
    
    switch (onboardingStatus.nextStep) {
      case 'values':
        if (location.pathname !== '/values') {
          return <Navigate to="/values" replace />;
        }
        break;
      default:
        // If onboarding is complete, allow access
        break;
    }
  }

  return <>{children}</>;
};
