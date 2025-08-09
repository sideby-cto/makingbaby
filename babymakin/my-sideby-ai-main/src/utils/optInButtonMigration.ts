/**
 * Migration utility to help transition from old opt-in buttons to ConsolidatedOptInButton
 * This file helps identify potential issues and provides migration guidance
 */

export interface MigrationReport {
  issues: string[];
  recommendations: string[];
  cleanupActions: string[];
}

export const generateMigrationReport = (): MigrationReport => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const cleanupActions: string[] = [];

  // Check for blur effect remnants in DOM
  const checkForBlurRemnants = () => {
    const overlays = document.querySelectorAll('[data-animation-overlay]');
    const blurElements = document.querySelectorAll('.backdrop-blur-sm, .blur-xl, .blur-lg');
    
    if (overlays.length > 0) {
      issues.push(`Found ${overlays.length} animation overlay remnants in DOM`);
      cleanupActions.push('Remove lingering animation overlays');
    }

    if (blurElements.length > 0) {
      const unexpectedBlur = Array.from(blurElements).filter(el => 
        !el.closest('[data-animation-overlay]') && 
        !el.closest('.dialog-content') &&
        !el.closest('.popover-content')
      );
      
      if (unexpectedBlur.length > 0) {
        issues.push(`Found ${unexpectedBlur.length} unexpected blur elements`);
        cleanupActions.push('Investigate and remove unexpected blur effects');
      }
    }
  };

  // Check for memory leaks
  const checkForMemoryLeaks = () => {
    // Check if timeouts are properly cleaned up
    const activeTimeouts = (window as any).__activeTimeouts || [];
    if (activeTimeouts.length > 10) {
      issues.push(`High number of active timeouts detected: ${activeTimeouts.length}`);
      recommendations.push('Implement useMemoryLeakProtection hook for timeout management');
    }
  };

  // Performance checks
  const checkPerformance = () => {
    const animationElements = document.querySelectorAll('[class*="animate-"]');
    if (animationElements.length > 20) {
      issues.push(`High number of animated elements: ${animationElements.length}`);
      recommendations.push('Consider reducing concurrent animations');
    }
  };

  // Run all checks
  checkForBlurRemnants();
  checkForMemoryLeaks();
  checkPerformance();

  // General recommendations
  recommendations.push('Use ConsolidatedOptInButton for all new opt-in implementations');
  recommendations.push('Test animation cleanup on slow devices');
  recommendations.push('Monitor console for memory leak warnings');

  return {
    issues,
    recommendations,
    cleanupActions
  };
};

/**
 * Force cleanup of any lingering animation effects
 */
export const forceCleanupAnimationEffects = (): boolean => {
  try {
    // Remove all animation overlays
    const overlays = document.querySelectorAll('[data-animation-overlay]');
    overlays.forEach(overlay => overlay.remove());

    // Remove any body classes that might affect blur
    document.body.classList.remove('blur-background', 'animation-active');

    // Clear any inline styles that might cause blur
    const elementsWithBlur = document.querySelectorAll('[style*="blur"], [style*="backdrop-filter"]');
    elementsWithBlur.forEach(el => {
      const element = el as HTMLElement;
      element.style.filter = '';
      element.style.backdropFilter = '';
    });

    return true;
  } catch (error) {
    console.error('Failed to cleanup animation effects:', error);
    return false;
  }
};

/**
 * Debug utility to log current animation state
 */
export const logAnimationDebugInfo = () => {
  const debug = {
    timestamp: new Date().toISOString(),
    overlays: document.querySelectorAll('[data-animation-overlay]').length,
    blurElements: document.querySelectorAll('.backdrop-blur-sm, .blur-xl, .blur-lg').length,
    animatedElements: document.querySelectorAll('[class*="animate-"]').length,
    bodyClasses: Array.from(document.body.classList),
    activeModals: document.querySelectorAll('[role="dialog"]').length
  };

  console.log('Animation Debug Info:', debug);
  return debug;
};