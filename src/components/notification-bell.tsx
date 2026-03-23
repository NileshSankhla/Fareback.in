import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import NotificationBellButton from "./notification-bell-button";

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
    <NotificationBellButton unreadCount={unreadCount} />
  );
};

export default NotificationBell;
