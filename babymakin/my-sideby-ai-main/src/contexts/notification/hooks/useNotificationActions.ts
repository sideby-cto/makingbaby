
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { NotificationPreferences } from "../types";

export interface NotificationActionsProps {
  userId: string | null | undefined;
  originalMarkAsRead: (id: string) => Promise<boolean>;
  originalMarkAllAsRead: () => Promise<void>;
  originalDeleteNotification: (id: string) => Promise<boolean>;
  originalUpdatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotificationActions = ({
  userId,
  originalMarkAsRead,
  originalMarkAllAsRead,
  originalDeleteNotification,
  originalUpdatePreferences,
  refresh
}: NotificationActionsProps) => {
  const { toast } = useToast();
  
  // Create a wrapper for markAsRead that ensures it returns a boolean
  const markAsRead = useCallback(
    async (id: string): Promise<boolean> => {
      console.log("markAsRead wrapper called for ID:", id);
      try {
        const result = await originalMarkAsRead(id);
        console.log("markAsRead result:", result);
        return result;
      } catch (error) {
        console.error("Error in markAsRead wrapper:", error);
        return false;
      }
    },
    [originalMarkAsRead]
  );

  // Create a wrapper for markAllAsRead to ensure consistent return type
  const markAllAsRead = useCallback(async (): Promise<void> => {
    console.log("markAllAsRead wrapper called");
    try {
      await originalMarkAllAsRead();
    } catch (error) {
      console.error("Error in markAllAsRead wrapper:", error);
    }
  }, [originalMarkAllAsRead]);

  // Create a wrapper for deleteNotification that ensures it returns a boolean
  const deleteNotification = useCallback(
    async (id: string): Promise<boolean> => {
      console.log("deleteNotification wrapper called for ID:", id);
      try {
        const result = await originalDeleteNotification(id);
        return result;
      } catch (error) {
        console.error("Error in deleteNotification wrapper:", error);
        return false;
      }
    },
    [originalDeleteNotification]
  );

  const updatePreferences = useCallback(
    async (prefs: NotificationPreferences) => {
      try {
        await originalUpdatePreferences(prefs);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    [originalUpdatePreferences]
  );

  // Toast notification function
  const addToast = useCallback(
    ({
      title,
      description,
      variant = "default",
      position = "top-right",
      duration = 3000,
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive" | "success";
      position?:
        | "top-right"
        | "top-center"
        | "top-left"
        | "bottom-right"
        | "bottom-center"
        | "bottom-left";
      duration?: number;
    }) => {
      console.log("Toast notification:", {
        title,
        description,
        variant,
        position,
        duration,
      });

      toast({
        title,
        description,
        variant: variant === "destructive" ? "destructive" : "default",
        duration,
      });
    },
    [toast]
  );

  const refreshNotifications = useCallback(async () => {
    console.log("Manual refresh of notifications requested");
    await refresh();
  }, [refresh]);

  const fetchNotifications = useCallback(async () => {
    // This is an alias for refresh for backward compatibility
    await refresh();
  }, [refresh]);

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    addToast,
    refreshNotifications,
    fetchNotifications
  };
};
