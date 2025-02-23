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
          <button className="relative">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge variant={"destructive"} className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full p-2">
                {unreadCount}
              </Badge>
            )}
          </button>
        </DrawerTrigger>
        <DrawerContent className="w-96">
          <DrawerHeader>
            <DrawerTitle className="font-ClashDisplayRegular text-emerald-500 tracking-normal">Notifications</DrawerTitle>
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
                    className={`p-4 rounded-lg shadow-sm ${
                      notification.read ? "bg-secondary" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
