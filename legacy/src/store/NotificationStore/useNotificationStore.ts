import { toast } from "@/hooks/use-toast";
import { NotificationType } from "@/Types/Types";
import axios from "axios";
import { create } from "zustand";

interface NotificationStore {
  isFetchingNotifications: boolean;
  notifications: NotificationType[];
  fetchNotifications: () => Promise<void>;

  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: number) => Promise<void>;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  isFetchingNotifications: false,
  notifications: [],
  fetchNotifications: async () => {
    set({ isFetchingNotifications: true });
    try {
      const response = await axios.get("/api/notifications");
      set({ notifications: response.data.notifications });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      set({ isFetchingNotifications: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await axios.post("/api/notifications", { notificationId });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.put("/api/notifications");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  removeNotification: async (notificationId) => {
    try {
      await axios.delete("/api/notifications?notificationId=" + notificationId);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== notificationId),
      }));
    } catch (error) {
      console.error("Failed to remove notifications:", error);
    }
  },

  clearAll: async () => {
    try {
      await axios.put("/api/notifications/clear");
      toast({
        title: "Notifications cleared",
        description: "All notifications have been removed.",
        variant: "default",
      });
      set({ notifications: [] });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  },
}));
