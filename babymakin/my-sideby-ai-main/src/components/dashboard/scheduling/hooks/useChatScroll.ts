
import { useRef, useEffect, useState, useCallback } from 'react';
import { MatchMessage } from '../types';

interface UseChatScrollProps {
  messages: MatchMessage[];
  matchId: string;
  smooth?: boolean;
}

export const useChatScroll = ({ messages, matchId, smooth = true }: UseChatScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastScrollTopRef = useRef(0);
  const lastMessageCountRef = useRef(0);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const isMobileRef = useRef(false);

  // Detect if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if the user is near the bottom of the chat
  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    
    // Larger threshold for mobile devices
    const threshold = isMobileRef.current ? 200 : 150;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    return nearBottom;
  }, []);

  // Scroll to the bottom of the chat
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing scroll timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    // Use a slightly longer timeout for mobile to ensure DOM updates are complete
    const delay = isMobileRef.current ? 100 : 50;
    
    scrollTimerRef.current = setTimeout(() => {
      if (!container) return;
      
      const targetScrollTop = container.scrollHeight - container.clientHeight;
      
      // For mobile, prefer instant scrolling to avoid animation issues
      if (isMobileRef.current || !smooth || isInitialLoadRef.current) {
        container.scrollTop = targetScrollTop;
      } else {
        // Smooth scroll for desktop
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, delay);
  }, [smooth]);

  // Handle scroll event to determine if we should auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      // Store the last scroll position
      lastScrollTopRef.current = container.scrollTop;
      
      // If user is near bottom, enable auto-scroll
      setShouldAutoScroll(isNearBottom());
    };

    // Use passive listeners for better performance on mobile
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also listen for touch events on mobile
    if (isMobileRef.current) {
      container.addEventListener('touchmove', handleScroll, { passive: true });
    }
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (isMobileRef.current) {
        container.removeEventListener('touchmove', handleScroll);
      }
    };
  }, [isNearBottom]);

  // Auto-scroll on new messages if we're at the bottom
  useEffect(() => {
    const newMessageCount = messages.length;
    
    // If we have new messages and we should auto-scroll
    if ((newMessageCount > lastMessageCountRef.current) && shouldAutoScroll) {
      scrollToBottom();
    }
    
    lastMessageCountRef.current = newMessageCount;
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // Reset state and scroll to bottom when match changes
  useEffect(() => {
    setShouldAutoScroll(true);
    lastMessageCountRef.current = 0;
    isInitialLoadRef.current = true;
    
    // Longer delay for mobile to ensure proper rendering
    const delay = isMobileRef.current ? 200 : 100;
    
    const timer = setTimeout(() => {
      scrollToBottom();
      // After initial scroll, enable smooth scrolling for subsequent scrolls (desktop only)
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 300);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [matchId, scrollToBottom]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    messagesEndRef,
    scrollToBottom,
    isNearBottom,
    shouldAutoScroll
  };
};
