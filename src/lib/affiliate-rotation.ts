import { db } from "@/lib/db";
import { getTotalAffiliateLinks, getAffiliateLink } from "@/lib/affiliate-links";
import { Redis } from "@upstash/redis";
import { sql } from "drizzle-orm";

const REDIS_COUNTER_KEY = "affiliate:amazon:counter";

let redisClient: Redis | null = null;

const getRedisClient = (): Redis | null => {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
};

const linkFromCounter = (currentCount: number): { index: number; url: string } => {
  const totalLinks = getTotalAffiliateLinks();
  const linkIndex = (currentCount - 1 + totalLinks) % totalLinks;
  return {
    index: linkIndex,
    url: getAffiliateLink(linkIndex),
  };
};

/**
 * Get the next affiliate link index and rotate the counter atomically.
 * This function is designed to handle concurrent requests safely.
 *
 * Uses a simple approach: track the counter in a separate table with atomic updates.
 */
export async function getNextAffiliateLinkIndex(): Promise<{
  index: number;
  url: string;
}> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const currentCount = await redis.incr(REDIS_COUNTER_KEY);
      return linkFromCounter(currentCount);
    } catch (error) {
      console.error("Upstash Redis increment failed, falling back to DB counter:", error);
    }
  }

  try {
    const result = await db.execute(sql`
      INSERT INTO affiliate_link_counter (id, link_count, updated_at)
      VALUES (1, 1, NOW())
      ON CONFLICT (id) DO UPDATE
      SET link_count = affiliate_link_counter.link_count + 1,
          updated_at = NOW()
      RETURNING link_count;
    `);

    let currentCount = 1;
    if (result.rows && result.rows.length > 0) {
      currentCount = (result.rows[0] as { link_count: number }).link_count;
    }
    return linkFromCounter(currentCount);
  } catch (error) {
    console.warn("DB counter failed, falling back to timestamp-based rotation:", error);

    const totalLinks = getTotalAffiliateLinks();
    const now = Date.now();
    const linkIndex = Math.floor(now / 1000) % totalLinks;
    return {
      index: linkIndex,
      url: getAffiliateLink(linkIndex),
    };
  }
}

/**
 * Get current counter value (for monitoring/debugging)
 */
export async function getCurrentCounterValue(): Promise<number> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const value = await redis.get<number>(REDIS_COUNTER_KEY);
      return typeof value === "number" ? value : 0;
    } catch {
      // Fall through to DB fallback
    }
  }

  try {
    const result = await db.execute(
      sql.raw(
        "SELECT link_count FROM affiliate_link_counter WHERE id = 1 LIMIT 1;"
      )
    );

    if (result.rows && result.rows.length > 0) {
      return (result.rows[0] as { link_count: number }).link_count;
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * Reset counter (admin operation)
 */
export async function resetCounterValue(newValue: number = 0): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_COUNTER_KEY, newValue);
      return;
    } catch (error) {
      console.error("Failed to reset Upstash Redis counter, falling back to DB:", error);
    }
  }

  try {
    await db.execute(sql`
      INSERT INTO affiliate_link_counter (id, link_count, updated_at)
      VALUES (1, ${newValue}, NOW())
      ON CONFLICT (id) DO UPDATE
      SET link_count = ${newValue}, updated_at = NOW();
    `);
  } catch (error) {
    console.error("Failed to reset counter:", error);
  }
}
