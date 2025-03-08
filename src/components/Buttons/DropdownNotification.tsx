"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/formatDate";
import { useNotificationStore } from "@/store/NotificationStore/useNotificationStore";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-10 z-50 w-[380px] rounded-3xl bg-primary-foreground shadow-lg border"
        >
          <div className="relative max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b sticky top-0 rounded-t-2xl z-10">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-ClashDisplayMedium text-emerald-600">
                  Notifications
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 bg-muted font-semibold transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-500 font-semibold" />
                </button>
              </div>
              <p className="text-sm text-neutral-500">
                You have {unreadCount} unread{" "}
                {unreadCount === 1 ? "notification" : "notifications"}
              </p>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  No notifications yet
                </div>
              ) : (
                <div className="p-4 space-y-1">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`relative rounded-lg border p-4 transition-colors ${
                        notification.read ? "bg-muted" : "bg-primary"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 relative">
                        <div className="space-y-1 flex-1">
                          <p
                            className={`text-sm ${
                              notification.read
                                ? "text-neutral-500"
                                : "text-primary-foreground font-medium"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4 mr-2" /> Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                removeNotification(notification.id)
                              }
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t sticky bottom-0 bg-primary-foreground rounded-2xl flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    className="flex-1"
                  >
                    Mark all as read
                  </Button>
                )}
                <Button
                  onClick={clearAll}
                  variant="destructive"
                  className="flex-1"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
