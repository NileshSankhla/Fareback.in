import Link from "next/link";
import Image from "next/image";
import { desc, eq, sql } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { clicks, merchants } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import HeroCarousel from "@/components/hero-carousel";
import TrackedHistory, { type TrackedHistoryItem } from "@/components/tracked-history";
import SmoothScrollLink from "@/components/smooth-scroll-link";

type ClickTrackingStatus = "unreviewed" | "tracked" | "approved";

const isTrackedOrApproved = <T extends { trackingStatus: ClickTrackingStatus }>(
  click: T,
): click is T & { trackingStatus: "tracked" | "approved" } =>
  click.trackingStatus === "tracked" || click.trackingStatus === "approved";

async function getFavoritePlatform(
  userId: number | null,
  merchantList: { id: number; name: string }[],
): Promise<string> {
  if (merchantList.length === 0) return "your favorite store";

  if (userId !== null) {
    try {
      const [top] = await db
        .select({
          merchantId: clicks.merchantId,
          count: sql<number>`count(*)::int`,
        })
        .from(clicks)
        .where(eq(clicks.userId, userId))
        .groupBy(clicks.merchantId)
        .orderBy(desc(sql`count(*)`))
        .limit(1);

      if (top) {
        const merchant = merchantList.find((m) => m.id === top.merchantId);
        if (merchant) return merchant.name;
      }
    } catch {
      // fall through to random selection
    }
  }

  return merchantList[Math.floor(Math.random() * merchantList.length)].name;
}

const Page = async () => {
  const user = await getCurrentUser();
  let merchantList: (typeof merchants.$inferSelect)[] = [];

  try {
    merchantList = await db.select().from(merchants);
  } catch (error) {
    console.error("Failed to fetch merchants:", error);
  }

  const supportedMerchantNames = new Set(["amazon", "flipkart", "myntra", "ajio"]);
  const visibleMerchantList = merchantList.filter((merchant) =>
    supportedMerchantNames.has(merchant.name.trim().toLowerCase()),
  );
  const favoritePlatform = await getFavoritePlatform(
    user?.id ?? null,
    visibleMerchantList,
  );

  let trackedItems: TrackedHistoryItem[] = [];
  if (user) {
    try {
      let userClicks: Array<{
        id: string;
        clickDate: Date;
        merchantName: string;
        trackingStatus: ClickTrackingStatus;
        rewardAmount: number;
      }> = [];

      try {
        userClicks = await db
          .select({
            id: clicks.id,
            clickDate: clicks.createdAt,
            merchantName: merchants.name,
            trackingStatus: clicks.trackingStatus,
            rewardAmount: clicks.rewardAmountInPaise,
          })
          .from(clicks)
          .innerJoin(merchants, eq(merchants.id, clicks.merchantId))
          .where(eq(clicks.userId, user.id))
          .orderBy(desc(clicks.createdAt))
          .limit(20);
      } catch (error) {
        console.error("Tracked history fallback (migration likely pending):", error);

        const legacyClicks = await db
          .select({
            id: clicks.id,
            clickDate: clicks.createdAt,
            merchantName: merchants.name,
          })
          .from(clicks)
          .innerJoin(merchants, eq(merchants.id, clicks.merchantId))
          .where(eq(clicks.userId, user.id))
          .orderBy(desc(clicks.createdAt))
          .limit(20);

        userClicks = legacyClicks.map((click) => ({
          ...click,
          trackingStatus: "tracked" as const,
          rewardAmount: 0,
        }));
      }

      trackedItems = userClicks
        .filter(isTrackedOrApproved)
        .map((click) => ({
          id: click.id,
          merchantName: click.merchantName,
          clickDate: click.clickDate,
          rewardAmount: click.rewardAmount,
          trackingStatus: click.trackingStatus,
        }));
    } catch (error) {
      console.error("Failed to fetch tracked history:", error);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-border/40 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Maximize Your Savings with Every Purchase
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Shop from India&apos;s top brands and earn guaranteed cashback.
              Track every purchase, withdraw via UPI, and save more on what you love.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <SmoothScrollLink
                  href="#offers"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                >
                  Shop Now
                </SmoothScrollLink>
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                >
                  Get Started Free
                </Link>
              )}
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-8 py-3.5 text-base font-semibold transition-all hover:bg-accent hover:scale-105"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions Carousel */}
      <HeroCarousel favoritePlatform={favoritePlatform} />

      {/* Cashback Partners */}
      <section id="offers" className="border-b border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Cashback Partners
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Shop from India&apos;s leading brands and earn cashback. Your favorite stores, now more rewarding.
            </p>
          </div>

          {visibleMerchantList.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                We&apos;re partnering with top brands. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleMerchantList.map((merchant) => (
                <a
                  key={merchant.id}
                  href={`/merchants?merchantId=${merchant.id}`}
                  className="group block"
                  aria-label={`Shop at ${merchant.name} and earn up to ${merchant.cashbackRate} cashback`}
                >
                  <Card className="h-full border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/40">
                    <CardHeader className="items-center pb-2">
                      {merchant.logoUrl ? (
                        <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-white p-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <Image
                            src={merchant.logoUrl}
                            alt={`${merchant.name} logo`}
                            width={48}
                            height={48}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <CardTitle className="text-center text-base font-semibold">
                        {merchant.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="font-semibold text-primary text-sm">
                        Upto 3.7% cashback*
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tracked History */}
      <section id="tracked-history" className="border-b border-border/40 py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your Earning History
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Track all your cashback rewards and approved transactions in one place.
            </p>
          </div>
          {user ? (
            <TrackedHistory items={trackedItems} />
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-6">
                Sign in to view your complete cashback history and track your earnings.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Sign In to Continue
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about earning cashback with Fareback
            </p>
          </div>
          <div className="mt-8 space-y-4">
            {[
              {
                q: "How long does it take to track my purchase?",
                a: "Purchases are typically tracked within 48 hours of completion. You'll see the transaction appear in your earning history once confirmed.",
              },
              {
                q: "When can I withdraw my cashback rewards?",
                a: "Rewards become available for withdrawal after 30 Days of purchase",
              },
              {
                q: "Is there a minimum withdrawal amount?",
                a: "No minimum required. You can request withdrawal for any amount available in your wallet, making it convenient to access your earnings anytime.",
              },
              {
                q: "What payment methods are supported for withdrawals?",
                a: "Currently, we support UPI payouts for quick and secure transfers directly to your bank account.",
              },
              {
                q: "How do I ensure my purchase is tracked correctly?",
                a: "Start with an empty cart, click through from Fareback to the merchant site, and complete your purchase in the same session without using external coupons.",
              },
            ].map(({ q, a }) => (
              <Card key={q} className="border-border/60 transition-all duration-200 hover:shadow-md hover:border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{a}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Ready to start earning cashback?</p>
            {user ? (
              <SmoothScrollLink
                href="#offers"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Shop Now
              </SmoothScrollLink>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Create Your Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;
