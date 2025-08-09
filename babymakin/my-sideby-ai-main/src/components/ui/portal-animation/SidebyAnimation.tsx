import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebyAnimationProps {
  animationUrl?: string;
  onComplete: () => void;
}

export const SidebyAnimation = ({ animationUrl, onComplete }: SidebyAnimationProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Glow effects */}
      <motion.div
        className="absolute w-64 h-64 bg-sideby-orange-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute w-48 h-48 bg-sideby-blue-500/20 rounded-full blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5
        }}
      />

      {/* Main animation container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10"
      >
        {imageError || !animationUrl ? (
          // Fallback animated logo
          <motion.div
            className="relative w-40 h-40 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {/* Animated rings */}
            <motion.div
              className="absolute w-full h-full border-4 border-sideby-orange-500/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-32 h-32 border-3 border-sideby-blue-500/40 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-24 h-24 border-2 border-sideby-burgundy-500/50 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Center glow */}
            <div className="w-16 h-16 bg-gradient-to-br from-sideby-orange-500 to-sideby-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">sideby</span>
            </div>
          </motion.div>
        ) : (
          // Actual sideby animation
          <div className="relative">
            {!imageLoaded && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: imageLoaded ? 0 : 1 }}
              >
                <Loader2 className="h-16 w-16 animate-spin text-sideby-orange-500" />
              </motion.div>
            )}
            
            <motion.img
              src={animationUrl}
              alt="sideby journey animation"
              className={cn(
                "object-contain transition-all duration-500",
                "w-40 h-40"
              )}
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              animate={{
                scale: imageLoaded ? [0.9, 1.05, 1] : 1,
                rotate: imageLoaded ? [0, 2, -2, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Ambient particles specific to sideby stage */}
      <div className="absolute inset-0">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-sideby-orange-400 rounded-full"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${30 + (i * 5)}%`
            }}
            animate={{
              y: [-20, -60, -20],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </div>
  );
};