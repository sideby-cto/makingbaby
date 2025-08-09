import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationGuardProps {
  onNavigate?: (path: string) => void;
}

export const NavigationGuard = ({ onNavigate }: NavigationGuardProps) => {
  const location = useLocation();

  useEffect(() => {
    // Clean up any lingering animation styles on navigation
    const cleanup = () => {
      document.body.style.backdropFilter = '';
      document.body.style.filter = '';
      document.body.style.overflow = '';
      
      // Remove any stuck overlays
      const overlays = document.querySelectorAll('[data-portal-overlay]');
      overlays.forEach(overlay => overlay.remove());
    };

    cleanup();
    onNavigate?.(location.pathname);
  }, [location.pathname, onNavigate]);

  return null;
};