
import { useEffect, useState, useCallback } from 'react';
import { activityTracker, ActivityEvent, ActivityTrackingOptions } from '@/services/activity/ActivityTrackingService';

interface UseActivityTrackingOptions extends ActivityTrackingOptions {
  autoStart?: boolean;
  maxEvents?: number;
}

export const useActivityTracking = (options: UseActivityTrackingOptions = {}) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const { autoStart = false, maxEvents = 100, ...trackingOptions } = options;

  const startTracking = useCallback(() => {
    activityTracker.startTracking(trackingOptions);
    setIsTracking(true);
  }, [trackingOptions]);

  const stopTracking = useCallback(() => {
    activityTracker.stopTracking();
    setIsTracking(false);
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const trackCustomEvent = useCallback((
    type: ActivityEvent['type'], 
    description: string, 
    metadata?: Record<string, any>
  ) => {
    activityTracker.trackCustomEvent(type, description, metadata);
  }, []);

  useEffect(() => {
    const removeListener = activityTracker.addListener((event: ActivityEvent) => {
      setActivities(prev => {
        const newActivities = [event, ...prev];
        return newActivities.slice(0, maxEvents);
      });
    });

    if (autoStart) {
      startTracking();
    }

    return () => {
      removeListener();
      if (autoStart) {
        stopTracking();
      }
    };
  }, [autoStart, startTracking, stopTracking, maxEvents]);

  const getTrackingStatus = useCallback(() => {
    return activityTracker.getTrackingStatus();
  }, []);

  return {
    activities,
    isTracking,
    startTracking,
    stopTracking,
    clearActivities,
    trackCustomEvent,
    getTrackingStatus
  };
};
