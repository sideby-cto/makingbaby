import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SIDEBY_ANIMATION_URL } from '@/utils/storageUtils';

interface SimplePortalAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  showMessage?: boolean;
  onMessageComplete?: () => void;
}

export const SimplePortalAnimation = ({
  isVisible,
  onComplete,
  showMessage,
  onMessageComplete
}: SimplePortalAnimationProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Emergency cleanup on route change
  useEffect(() => {
    if (location.pathname === '/toolbox' && isVisible) {
      // Force immediate cleanup if we're on toolbox page
      document.body.style.backdropFilter = '';
      document.body.style.filter = '';
      document.body.style.overflow = '';
      onComplete?.();
    }
  }, [location.pathname, isVisible, onComplete]);

  const handleAnimationComplete = useCallback(() => {
    if (isExiting) {
      // Ensure body blur cleanup
      document.body.style.backdropFilter = '';
      document.body.style.filter = '';
      onComplete?.();
    }
  }, [isExiting, onComplete]);

  const handleGotItClick = useCallback(() => {
    // Force immediate cleanup before triggering callbacks
    document.body.style.backdropFilter = '';
    document.body.style.filter = '';
    document.body.style.overflow = '';
    
    // Set exiting state
    setIsExiting(true);
    
    // Let parent component handle what happens next
    onMessageComplete?.();
    onComplete?.();
  }, [onMessageComplete, onComplete]);

  const handleImageLoad = useCallback(() => {
    // Image loaded successfully - let parent handle timing
  }, []);

  const handleImageError = useCallback(() => {
    // Fallback if image fails to load - let parent handle timing
    onComplete?.();
  }, [onComplete]);

  return <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && <motion.div initial={{
      opacity: 0,
      backdropFilter: 'blur(0px)'
    }} animate={{
      opacity: 1,
      backdropFilter: 'blur(4px)'
    }} exit={{
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }} transition={{
      duration: 0.4,
      ease: "easeOut"
    }} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80" style={{
      isolation: 'isolate'
    }} data-portal-overlay onAnimationStart={() => {
      if (!isVisible) setIsExiting(true);
    }}>
          {showMessage ? <motion.div initial={{
        scale: 0.9,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0.9,
        opacity: 0,
        transition: {
          duration: 0.4,
          ease: "easeInOut"
        }
      }} transition={{
        duration: 0.4,
        ease: "easeOut"
      }} className="relative bg-background/95 backdrop-blur-sm rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl border border-border/20">
              <motion.div initial={{
          y: 10,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.2,
          duration: 0.4
        }} className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-foreground">
                    🎓 You're Enrolled!
                  </h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      You're signed up to earn your Back to School Badge and will be matched 4 times in September to engage. It's going to be a great year!
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Your sideby toolbox is where we'll see the results of your effort.
                    </p>
                  </div>
                </div>
                <Button onClick={handleGotItClick} className="w-full" size="lg">Let's do this!</Button>
              </motion.div>
            </motion.div> : <motion.div initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0.9,
        opacity: 0,
        transition: {
          duration: 0.4,
          ease: "easeInOut"
        }
      }} transition={{
        duration: 0.4,
        ease: "easeOut"
      }} className="relative flex items-center justify-center">
              {SIDEBY_ANIMATION_URL ? <img src={SIDEBY_ANIMATION_URL} alt="sideby animation" className="max-w-sm max-h-sm object-contain" onLoad={handleImageLoad} onError={handleImageError} /> : <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                  <motion.div animate={{
            rotate: 360
          }} transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }} className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full" />
                </div>}
            </motion.div>}
        </motion.div>}
    </AnimatePresence>;
};
