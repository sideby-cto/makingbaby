import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Compass, CheckCircle, Loader2, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSimpleAnimation } from '@/hooks/useSimpleAnimation';
import { SimplePortalAnimation } from '@/components/ui/portal-animation/SimplePortalAnimation';

interface ConsolidatedOptInButtonProps {
  isOptedIn: boolean;
  onToggle: () => Promise<void>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'brand' | 'secondary';
  className?: string;
  disabled?: boolean;
  badgeName?: string;
}

export const ConsolidatedOptInButton = ({
  isOptedIn,
  onToggle,
  size = 'lg',
  variant = 'brand',
  className,
  disabled = false,
  badgeName
}: ConsolidatedOptInButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [justOptedIn, setJustOptedIn] = useState(false);
  
  const { toast } = useToast();
  
  const navigate = useNavigate();
  
  const navigateToToolbox = useCallback(() => {
    // Force complete cleanup before navigation
    document.body.style.backdropFilter = '';
    document.body.style.filter = '';
    document.body.style.overflow = '';
    
    // Use React Router for navigation instead of window.location
    navigate('/toolbox');
  }, [navigate]);

  const { isPlaying: isAnimating, showMessage, startAnimation, completeAnimation } = useSimpleAnimation({
    onComplete: () => {
      setJustOptedIn(true);
      setIsProcessing(false);
      
      // Small delay to ensure portal animation backdrop disappears before showing modal
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 100);
      
      // Show success toast
      toast({
        title: "✨ You're enrolled!",
        description: `You'll be notified when the ${badgeName || 'badge'} launches.`,
        variant: "default",
      });
    },
    onNavigateToToolbox: navigateToToolbox
  });


  const handleClick = async () => {
    if (disabled || isProcessing || isAnimating) return;
    
    setIsProcessing(true);
    
    try {
      if (!isOptedIn) {
        // Start the animation and call toggle
        startAnimation();
        await onToggle();
      } else {
        // For opting out, no animation needed
        await onToggle();
        setIsProcessing(false);
        toast({
          title: "Opted out",
          description: `You won't receive notifications for the ${badgeName || 'badge'}.`,
          variant: "default",
        });
      }
    } catch (error) {
      setIsProcessing(false);
      
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setJustOptedIn(false);
  }, []);

  // Let React handle DOM cleanup naturally when showSidebyAnimation changes

  return (
    <>
      <Button
        onClick={handleClick}
        variant={isOptedIn ? "outline" : variant}
        size={size}
        disabled={disabled || isProcessing}
        className={cn(
          "min-w-[160px] relative overflow-hidden transition-all duration-300",
          "shadow-lg hover:shadow-xl",
          isOptedIn && !justOptedIn && "bg-success/10 text-success border-success/30 hover:bg-success/20",
          justOptedIn && "bg-success text-success-foreground border-success hover:bg-success/90",
          isProcessing && "cursor-not-allowed",
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          {/* Enhanced processing shimmer effect */}
          {(isProcessing || isAnimating) && !isOptedIn && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
          )}
          
          {/* Button content */}
          <div className={cn(
            "flex items-center gap-2 transition-all duration-300 relative z-10",
            (isProcessing || isAnimating) && "animate-pulse"
          )}>
            {isProcessing || isAnimating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">
                  {isOptedIn ? "Opting out..." : isAnimating ? "Opening portal..." : "Opting in..."}
                </span>
              </>
            ) : isOptedIn ? (
              <>
                <div className="relative">
                  <CheckCircle className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    justOptedIn ? "text-success-foreground" : "text-success"
                  )} />
                  {justOptedIn && (
                    <div className="absolute inset-0 bg-success/30 rounded-full animate-ping" />
                  )}
                </div>
                <span className={cn(
                  "font-semibold tracking-wide transition-colors duration-300",
                  justOptedIn ? "text-success-foreground" : "text-success"
                )}>
                  You're enrolled to earn the back to school badge.
                </span>
              </>
            ) : (
              <>
                <Compass className="h-4 w-4" />
                <span className="font-medium">Enroll Now</span>
              </>
            )}
          </div>
        </div>

      </Button>

      {/* Simple Portal Animation */}
      <SimplePortalAnimation
        isVisible={isAnimating}
        showMessage={showMessage}
        onComplete={completeAnimation}
        onMessageComplete={navigateToToolbox}
      />

      {/* Success confirmation modal - higher z-index to ensure it appears above animation */}
      <Dialog open={showSuccessModal} onOpenChange={handleSuccessModalClose}>
        <DialogContent className="sm:max-w-md z-[10001] bg-background/95 backdrop-blur-sm">
          <DialogHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
              </div>
            </div>
            <DialogTitle className="text-xl font-semibold text-success">
              🎉 You're enrolled!
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p>
                You'll be among the first to know when the{' '}
                <span className="font-semibold text-foreground">
                  {badgeName || 'badge'}
                </span>{' '}
                launches.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">What happens next?</p>
                  <p className="text-xs text-muted-foreground">
                    We'll send you an email when the badge is ready to earn
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleSuccessModalClose}
                className="w-full"
                size="sm"
              >
                Got it!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
