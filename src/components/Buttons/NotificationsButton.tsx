"use client"; // Mark as a Client Component

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore"; // Import the store
import { BellIcon } from "lucide-react";

export default function NotificationButton() {
  const {
    isFetchingNotifications,
    notifications,
    fetchNotifications,
    markAllAsRead,
  } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div>
      {/* Notification Button */}
      <Drawer direction="top">
        <DrawerTrigger asChild>
          <Button variant="ghost" className="relative">
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-2">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>
              You have {unreadCount} unread notifications.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[400px] px-4">
            <div className="space-y-4">
              {isFetchingNotifications ? (
                <p>Loading notifications...</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg ${
                      notification.read ? "bg-secondary" : "bg-white shadow-sm"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DrawerFooter>
            <Button onClick={markAllAsRead} className="w-full">
              Mark All as Read
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
