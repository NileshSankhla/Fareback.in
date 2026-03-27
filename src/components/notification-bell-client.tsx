"use client";

import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LAST_PATH_KEY = "fareback:last-path";

const NotificationBellClient = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const isNotificationsOpen = pathname.startsWith("/notifications");

  useEffect(() => {
    if (!isNotificationsOpen) {
      sessionStorage.setItem(LAST_PATH_KEY, pathname);
    }
  }, [isNotificationsOpen, pathname]);

  useEffect(() => {
    if (isNotificationsOpen) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/user/notifications/unread-count", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
  }, [isNotificationsOpen, pathname]);

  const handleClick = () => {
    if (isNotificationsOpen) {
      const previousPath = sessionStorage.getItem(LAST_PATH_KEY);
      router.push(
        previousPath && !previousPath.startsWith("/notifications")
          ? previousPath
          : "/"
      );
      return;
    }

    router.push("/notifications");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"
      aria-label={isNotificationsOpen ? "Close notifications" : "Open notifications"}
    >
      <Bell className="h-4 w-4" />
      {unreadCount !== null && unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
};

export default NotificationBellClient;
