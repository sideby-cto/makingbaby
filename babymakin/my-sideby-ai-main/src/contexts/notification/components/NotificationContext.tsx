
import { createContext } from "react";
import { NotificationContextType } from "../types";

// Create initial context value with default implementations
const initialContextValue: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  addToast: () => {},
  markAsRead: async () => false,
  markAllAsRead: async () => {},
  deleteNotification: async () => false,
  fetchNotifications: async () => {},
  refreshNotifications: async () => {},
  preferences: null,
  updatePreferences: async () => {
    return { success: false };
  },
  loading: false,
  isLoading: false,
};

// Create the context with initial values
export const NotificationContext = createContext<NotificationContextType>(initialContextValue);
