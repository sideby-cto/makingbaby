
import { supabase } from '@/integrations/supabase/client';

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: "page_view" | "click" | "scroll" | "notification" | "message" | "form_interaction" | "navigation";
  description: string;
  metadata?: Record<string, any>;
  userId?: string;
  url?: string;
  element?: string;
}

export interface ActivityTrackingOptions {
  enablePageViews?: boolean;
  enableClicks?: boolean;
  enableScrolling?: boolean;
  enableFormInteractions?: boolean;
  trackingUserId?: string | null;
  onActivity?: (event: ActivityEvent) => void;
}

class ActivityTrackingService {
  private isTracking = false;
  private options: ActivityTrackingOptions = {};
  private listeners: Array<(event: ActivityEvent) => void> = [];
  private activityBuffer: ActivityEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.handleClick = this.handleClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleFormInteraction = this.handleFormInteraction.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
  }

  startTracking(options: ActivityTrackingOptions = {}) {
    if (this.isTracking) return;

    this.options = {
      enablePageViews: true,
      enableClicks: true,
      enableScrolling: true,
      enableFormInteractions: true,
      ...options
    };

    this.isTracking = true;

    // Set up event listeners
    if (this.options.enablePageViews) {
      this.trackPageView();
      window.addEventListener('popstate', this.handleNavigation);
    }

    if (this.options.enableClicks) {
      document.addEventListener('click', this.handleClick, true);
    }

    if (this.options.enableScrolling) {
      document.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    if (this.options.enableFormInteractions) {
      document.addEventListener('input', this.handleFormInteraction, true);
      document.addEventListener('change', this.handleFormInteraction, true);
    }

    // Start periodic buffer flush
    this.flushInterval = setInterval(() => {
      this.flushActivityBuffer();
    }, 5000); // Flush every 5 seconds

    console.log('Activity tracking started', this.options);
  }

  stopTracking() {
    if (!this.isTracking) return;

    this.isTracking = false;

    // Remove event listeners
    window.removeEventListener('popstate', this.handleNavigation);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('input', this.handleFormInteraction, true);
    document.removeEventListener('change', this.handleFormInteraction, true);

    // Clear flush interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush remaining activities
    this.flushActivityBuffer();

    console.log('Activity tracking stopped');
  }

  addListener(callback: (event: ActivityEvent) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private createEvent(type: ActivityEvent['type'], description: string, metadata?: Record<string, any>): ActivityEvent {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      description,
      metadata,
      userId: this.options.trackingUserId || undefined,
      url: window.location.href
    };
  }

  private emitEvent(event: ActivityEvent) {
    // Add to buffer for periodic flushing
    this.activityBuffer.push(event);

    // Notify listeners immediately
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in activity listener:', error);
      }
    });

    // Call options callback if provided
    if (this.options.onActivity) {
      this.options.onActivity(event);
    }
  }

  private async flushActivityBuffer() {
    if (this.activityBuffer.length === 0) return;

    const activities = [...this.activityBuffer];
    this.activityBuffer = [];

    try {
      // Store activities in Supabase if user is tracked
      if (this.options.trackingUserId) {
        await this.logEngagementBatch(activities);
      }
    } catch (error) {
      console.error('Failed to flush activity buffer:', error);
    }
  }

  private async logEngagementBatch(activities: ActivityEvent[]) {
    try {
      // Get user's community_id from their active membership
      const { data: membership } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', this.options.trackingUserId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!membership?.community_id) {
        console.warn('No active community membership found for user, skipping activity logging');
        return;
      }

      const communityId = membership.community_id;

      const engagementLogs = activities.map(activity => ({
        user_id: this.options.trackingUserId!,
        community_id: communityId,
        engagement_type: `activity_${activity.type}`,
        metadata: {
          description: activity.description,
          url: activity.url,
          element: activity.element,
          timestamp: activity.timestamp.toISOString(),
          ...activity.metadata
        }
      }));

      const { error } = await supabase
        .from('engagement_logs')
        .insert(engagementLogs);

      if (error) {
        console.error('Failed to log engagement batch:', error);
      }
    } catch (error) {
      console.error('Error logging engagement batch:', error);
    }
  }

  private trackPageView() {
    const event = this.createEvent('page_view', `Viewed ${document.title}`, {
      path: window.location.pathname,
      title: document.title
    });
    this.emitEvent(event);
  }

  private handleNavigation() {
    setTimeout(() => {
      this.trackPageView();
    }, 100); // Small delay to ensure page title is updated
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    let description = 'Clicked';
    let element = target.tagName.toLowerCase();

    // Get more specific descriptions based on element type
    if (target.getAttribute('aria-label')) {
      description = `Clicked "${target.getAttribute('aria-label')}"`;
    } else if (target.textContent && target.textContent.trim().length < 50) {
      description = `Clicked "${target.textContent.trim()}"`;
    } else if (target.id) {
      description = `Clicked element #${target.id}`;
    } else if (target.className) {
      const mainClass = target.className.split(' ')[0];
      description = `Clicked .${mainClass}`;
    }

    const event_obj = this.createEvent('click', description, {
      element,
      elementId: target.id || undefined,
      elementClass: target.className || undefined,
      elementText: target.textContent?.trim().substring(0, 100) || undefined,
      coordinates: { x: event.clientX, y: event.clientY }
    });

    this.emitEvent(event_obj);
  }

  private throttle(func: Function, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    return function executedFunction(...args: any[]) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
    };
  }

  private handleScroll = this.throttle(() => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercent > 0 && scrollPercent <= 100) {
      const event = this.createEvent('scroll', `Scrolled to ${scrollPercent}%`, {
        scrollY: window.scrollY,
        scrollPercent,
        documentHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight
      });
      this.emitEvent(event);
    }
  }, 1000);

  private handleFormInteraction(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    let description = 'Form interaction';
    const elementType = target.type || target.tagName.toLowerCase();

    if (target.name) {
      description = `Interacted with field "${target.name}"`;
    } else if (target.id) {
      description = `Interacted with field #${target.id}`;
    } else if (target.placeholder) {
      description = `Interacted with "${target.placeholder}"`;
    }

    const event_obj = this.createEvent('form_interaction', description, {
      fieldType: elementType,
      fieldName: target.name || undefined,
      fieldId: target.id || undefined,
      eventType: event.type
    });

    this.emitEvent(event_obj);
  }

  // Method to manually track custom events
  trackCustomEvent(type: ActivityEvent['type'], description: string, metadata?: Record<string, any>) {
    const event = this.createEvent(type, description, metadata);
    this.emitEvent(event);
  }

  // Get current tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      options: this.options,
      listenerCount: this.listeners.length,
      bufferSize: this.activityBuffer.length
    };
  }
}

// Export singleton instance
export const activityTracker = new ActivityTrackingService();
