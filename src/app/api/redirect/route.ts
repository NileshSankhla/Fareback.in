import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { clicks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import {
  COMING_SOON_MERCHANT_NAMES,
  getMerchantById,
  SUPPORTED_MERCHANT_NAMES,
} from "@/lib/data/merchants";
import { getAffiliateLinkByIndex, getNextAffiliateLinkIndex } from "@/lib/affiliate-rotation";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const TEST_MERCHANT_HOMEPAGES: Record<string, string> = {
  flipkart: "https://fktr.in/49T8I82",
  myntra: "https://myntr.it/auK4aA9",
  ajio: "https://ajiio.in/xTvzcfm",
};

const IDEMPOTENCY_LOCK_TTL_SECONDS = 3;
const IDEMPOTENCY_WAIT_MS = 150;

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const appendSubidParam = (urlString: string, subid: string): string => {
  const url = new URL(urlString);
  // Append subid parameter without damaging existing parameters
  url.searchParams.append("subid", subid);
  return url.toString();
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const merchantIdParam = searchParams.get("merchantId");

    if (!merchantIdParam) {
      return NextResponse.json(
        { error: "merchantId is required" },
        { status: 400 },
      );
    }

    const merchantId = parseInt(merchantIdParam, 10);
    if (isNaN(merchantId)) {
      return NextResponse.json({ error: "Invalid merchantId" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      const redirectTo = new URL(
        `/sign-in?redirect=/merchants?merchantId=${merchantId}`,
        request.url,
      );
      return NextResponse.redirect(redirectTo, { status: 307 });
    }

    const merchant = await getMerchantById(merchantId);

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const merchantNameKey = merchant.name.trim().toLowerCase();
    if (COMING_SOON_MERCHANT_NAMES.has(merchantNameKey)) {
      const comingSoonUrl = new URL(`/coming-soon/${merchantNameKey}`, request.url);
      return NextResponse.redirect(comingSoonUrl, { status: 307 });
    }

    if (!SUPPORTED_MERCHANT_NAMES.has(merchantNameKey)) {
      return NextResponse.json(
        { error: "Merchant is not currently supported" },
        { status: 404 },
      );
    }

    const redis = getRedisClient();
    const lockKey = `affiliate:redirect:lock:${user.id}:${merchantId}`;
    let lockAcquired = false;

    if (redis) {
      try {
        const lockResult = await redis.set(lockKey, "1", {
          nx: true,
          ex: IDEMPOTENCY_LOCK_TTL_SECONDS,
        });
        lockAcquired = lockResult === "OK";

        if (!lockAcquired) {
          await sleep(IDEMPOTENCY_WAIT_MS);
        }
      } catch (error) {
        console.warn("Could not acquire idempotency lock, continuing without lock:", error);
      }
    }

    try {
      const duplicateCutoff = new Date(Date.now() - 10_000);
      const [recentClick] = await db
        .select({
          id: clicks.id,
          affiliateLinkIndex: clicks.affiliateLinkIndex,
          affiliateLinkUrl: clicks.affiliateLinkUrl,
        })
        .from(clicks)
        .where(
          and(
            eq(clicks.userId, user.id),
            eq(clicks.merchantId, merchantId),
            gte(clicks.createdAt, duplicateCutoff),
          ),
        )
        .orderBy(desc(clicks.createdAt))
        .limit(1);

      // Get affiliate link info if it's Amazon
      let affiliateLinkIndex: number | null = null;
      let affiliateLinkUrl: string | null = null;

      if (merchantNameKey === "amazon" && recentClick) {
        if (recentClick.affiliateLinkUrl) {
          affiliateLinkUrl = recentClick.affiliateLinkUrl;
          affiliateLinkIndex = recentClick.affiliateLinkIndex;
        } else if (recentClick.affiliateLinkIndex !== null) {
          affiliateLinkIndex = recentClick.affiliateLinkIndex;
          affiliateLinkUrl = await getAffiliateLinkByIndex(recentClick.affiliateLinkIndex);
        }
      } else if (merchantNameKey === "amazon") {
        try {
          const linkInfo = await getNextAffiliateLinkIndex();
          affiliateLinkIndex = linkInfo.index;
          affiliateLinkUrl = linkInfo.url;
        } catch (error) {
          console.error("Failed to get affiliate link:", error);
          // Fall back to default URL if affiliate system fails
          affiliateLinkUrl =
            "https://www.amazon.in?&linkCode=ll2&tag=fareback-21&linkId=711b78face92a1bf8be6139d25b1f780&ref_=as_li_ss_tl";
        }
      }

      if (!recentClick) {
        try {
          await db
            .insert(clicks)
            .values({
              userId: user.id,
              merchantId,
              affiliateLinkIndex,
              affiliateLinkUrl,
            })
            .execute();
        } catch (insertError) {
          // Backward compatibility when migration for affiliate columns is pending.
          console.warn("Clicks insert with affiliate metadata failed, falling back:", insertError);
          await db
            .insert(clicks)
            .values({
              userId: user.id,
              merchantId,
            })
            .execute();
        }
      }

      let destinationUrl: URL;
      try {
        let baseUrl: string;

        if (merchantNameKey === "amazon" && affiliateLinkUrl) {
          baseUrl = affiliateLinkUrl;
        } else {
          const testingHomepage = TEST_MERCHANT_HOMEPAGES[merchantNameKey];
          baseUrl = testingHomepage ?? merchant.baseUrl;
        }

        if (merchantNameKey !== "amazon") {
          // Keep subid for non-Amazon merchants where supported.
          const subid = user.name || user.email.split("@")[0];
          baseUrl = appendSubidParam(baseUrl, subid);
        }

        destinationUrl = new URL(baseUrl);
      } catch {
        return NextResponse.json(
          { error: "Invalid merchant URL" },
          { status: 500 },
        );
      }

      return NextResponse.redirect(destinationUrl.toString(), { status: 307 });
    } finally {
      if (lockAcquired && redis) {
        try {
          await redis.del(lockKey);
        } catch {
          // Ignore unlock errors. TTL also protects against stale locks.
        }
      }
    }
  } catch (error) {
    console.error("Error in redirect API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
