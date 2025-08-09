import { useState, useCallback } from 'react';
import { useMemoryLeakProtection } from './useMemoryLeakProtection';

interface UseSimpleAnimationOptions {
  onComplete?: () => void;
  onAnimationPhaseComplete?: () => void;
  onNavigateToToolbox?: () => void;
  duration?: number;
}

export const useSimpleAnimation = ({ onComplete, onAnimationPhaseComplete, onNavigateToToolbox, duration = 8000 }: UseSimpleAnimationOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [activeTimeoutId, setActiveTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { safeSetTimeout, clearSafeTimeout } = useMemoryLeakProtection();

  const startAnimation = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setShowMessage(false);
    
    // After animation duration, transition to message phase
    const timeoutId = safeSetTimeout(() => {
      setShowMessage(true);
      setActiveTimeoutId(null);
      onAnimationPhaseComplete?.();
    }, duration);
    
    setActiveTimeoutId(timeoutId);
    return timeoutId;
  }, [isPlaying, onAnimationPhaseComplete, duration, safeSetTimeout]);

  const completeAnimation = useCallback(() => {
    // Clear any pending timeouts
    if (activeTimeoutId) {
      clearSafeTimeout(activeTimeoutId);
      setActiveTimeoutId(null);
    }
    
    // Force cleanup of any body styles
    document.body.style.backdropFilter = '';
    document.body.style.filter = '';
    document.body.style.overflow = '';
    
    // Reset all animation states
    setIsPlaying(false);
    setShowMessage(false);
    
    // Call completion callback
    onComplete?.();
  }, [onComplete, clearSafeTimeout, activeTimeoutId]);

  const stopAnimation = useCallback(() => {
    // Force cleanup of any body styles
    document.body.style.backdropFilter = '';
    document.body.style.filter = '';
    document.body.style.overflow = '';
    
    // Reset states
    setIsPlaying(false);
    setShowMessage(false);
  }, []);

  return {
    isPlaying,
    showMessage,
    startAnimation,
    completeAnimation,
    stopAnimation
  };
};