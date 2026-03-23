"use client";

import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface NotificationBellButtonProps {
  unreadCount: number;
}

const LAST_PATH_KEY = "fareback:last-path";

const NotificationBellButton = ({ unreadCount }: NotificationBellButtonProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isNotificationsOpen = pathname.startsWith("/notifications");

  useEffect(() => {
    if (!isNotificationsOpen) {
      sessionStorage.setItem(LAST_PATH_KEY, pathname);
    }
  }, [isNotificationsOpen, pathname]);

  const handleClick = () => {
    if (isNotificationsOpen) {
      const previousPath = sessionStorage.getItem(LAST_PATH_KEY);
      router.push(
        previousPath && !previousPath.startsWith("/notifications")
          ? previousPath
          : "/",
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
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
};

export default NotificationBellButton;
