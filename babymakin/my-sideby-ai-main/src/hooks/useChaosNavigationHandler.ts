import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook to handle chaos testing navigation events
 * This prevents the chaos testing service from bypassing React Router
 * Only handles chaos events, not normal navigation
 */
export const useChaosNavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleChaosNavigation = (event: CustomEvent<{ route: string }>) => {
      const { route } = event.detail;
      
      // Only handle chaos navigation if it's explicitly a chaos event
      // Check if the current route is already the target to prevent redirect loops
      if (location.pathname === route) {
        console.log('[ChaosNavigationHandler] Already on target route, skipping navigation');
        return;
      }
      
      // Add safety check to prevent interfering with normal app navigation
      if (!route.startsWith('/chaos') && !route.includes('test')) {
        console.log('[ChaosNavigationHandler] Skipping non-chaos route:', route);
        return;
      }
      
      try {
        console.log('[ChaosNavigationHandler] Chaos navigation to:', route);
        navigate(route);
      } catch (error) {
        console.warn('[ChaosNavigationHandler] Chaos navigation failed:', error);
      }
    };

    // Listen for chaos navigation events only
    window.addEventListener('chaos-navigate', handleChaosNavigation as EventListener);

    return () => {
      window.removeEventListener('chaos-navigate', handleChaosNavigation as EventListener);
    };
  }, [navigate, location.pathname]);
};