"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NotificationDropdown from "./DropdownNotification";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore";

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications ,fetchNotifications} = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-2 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
