import Link from "next/link";
import { and, eq, sql } from "drizzle-orm";
import { Bell } from "lucide-react";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

interface NotificationBellProps {
  userId: number;
}

const NotificationBell = async ({ userId }: NotificationBellProps) => {
  const [counts] = await db
    .select({
      unreadCount: sql<number>`count(*)::int`,
    })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  const unreadCount = counts?.unreadCount ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"
      aria-label="Open notifications"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
};

export default NotificationBell;
