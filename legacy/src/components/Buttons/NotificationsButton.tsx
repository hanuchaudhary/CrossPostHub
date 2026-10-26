"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import NotificationDropdown from "./DropdownNotification";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore";
import { IconBellFilled } from "@tabler/icons-react";

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
        className="relative inline-flex md:h-10 md:w-10 h-6 w-6  items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
      >
        <IconBellFilled className="md:h-5 md:w-5 h-3 w-3" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 flex md:h-5 md:w-5 w-2 h-2  items-center justify-center rounded-full p-2 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
