import { NotificationType } from "@/Types/Types";
import axios from "axios";
import { create } from "zustand";

interface NotificationStore {
  isFetchingNotifications: boolean;
  notifications: NotificationType[];
  fetchNotifications: () => Promise<void>;

  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: () => Promise<void>;
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

  markAsRead: async (notificationId: string) => {
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

  removeNotification: async () => {
    try {
      await axios.delete("/api/notifications");
      set((state) => ({
        notifications: state.notifications.filter((n) => n.read),
      }));
    } catch (error) {
      console.error("Failed to remove notifications:", error);
    }
  },
}));
