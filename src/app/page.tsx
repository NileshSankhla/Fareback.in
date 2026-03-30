import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Zap,
} from "lucide-react";
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
import ShopNowButton from "@/components/shop-now-button";
import {
  COMING_SOON_MERCHANT_NAMES,
  getAllMerchants,
  SUPPORTED_MERCHANT_NAMES,
} from "@/lib/data/merchants";

type ClickTrackingStatus = "unreviewed" | "tracked" | "approved" | "deleted";

const isTrackedOrApproved = <T extends { trackingStatus: ClickTrackingStatus }>(
  click: T,
): click is T & { trackingStatus: "tracked" | "approved" } =>
  click.trackingStatus === "tracked" || click.trackingStatus === "approved";

const Page = async () => {
  const user = await getCurrentUser();
  let merchantList: (typeof merchants.$inferSelect)[] = [];

  try {
    merchantList = await getAllMerchants();
  } catch (error) {
    console.error("Failed to fetch merchants:", error);
  }

  const visibleMerchantList = merchantList.filter((merchant) =>
    SUPPORTED_MERCHANT_NAMES.has(merchant.name.trim().toLowerCase()),
  );
  const defaultFavoritePlatform =
    visibleMerchantList
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))[0]?.name ?? "your favorite store";
  let favoritePlatform = defaultFavoritePlatform;

  let trackedItems: TrackedHistoryItem[] = [];
  if (user) {
    try {
      const userClicks = await db
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

      trackedItems = userClicks
        .filter(isTrackedOrApproved)
        .map((click) => ({
          id: click.id,
          merchantName: click.merchantName,
          clickDate: click.clickDate,
          rewardAmount: click.rewardAmount,
          trackingStatus: click.trackingStatus,
        }));

      if (userClicks.length > 0) {
        const merchantFrequency = new Map<string, number>();
        for (const click of userClicks) {
          merchantFrequency.set(
            click.merchantName,
            (merchantFrequency.get(click.merchantName) ?? 0) + 1,
          );
        }

        favoritePlatform = [...merchantFrequency.entries()].sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0] ?? defaultFavoritePlatform;
      }
    } catch (error) {
      console.error("Failed to fetch tracked history:", error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <section className="relative overflow-hidden border-b border-border/40 pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 opacity-30">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-[120px] animate-pulse" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">India&apos;s Smartest Cashback Platform</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
              Maximize Savings on <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-amber-500 bg-clip-text text-transparent">
                Every Purchase.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
               Shop from India&apos;s top brands and earn guaranteed cashback.
               Track automatically, withdraw via UPI, and never leave money on the table again.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              {user ? (
                <ShopNowButton className="group inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] sm:w-auto" />
              ) : (
                <Link
                  href="/sign-in"
                  className="group inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}

              <Link
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-border bg-background/50 px-8 py-4 text-base font-semibold backdrop-blur-sm transition-all hover:scale-105 hover:bg-accent hover:text-accent-foreground sm:w-auto"
              >
                See How It Works
              </Link>
            </div>

            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 pt-12 opacity-80 sm:grid-cols-3">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-primary" /> Seamless Tracking
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" /> 100% Secure UPI
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" /> Highest Rates
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="how-it-works" className="relative z-20 bg-background">
        <HeroCarousel favoritePlatform={favoritePlatform} />
      </div>

      <section id="offers" className="relative border-y border-border/40 bg-muted/10 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Premium Partners
            </h2>
            <p className="text-lg text-muted-foreground">
              We partnered with the brands you already love. Click through Fareback before you shop to activate your rewards.
            </p>
          </div>

          {visibleMerchantList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xl font-medium text-muted-foreground">
                Activating premium brands. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleMerchantList.map((merchant) => {
                const merchantNameKey = merchant.name.trim().toLowerCase();
                const isComingSoon = COMING_SOON_MERCHANT_NAMES.has(merchantNameKey);
                const merchantHref = isComingSoon
                  ? `/coming-soon/${merchantNameKey}`
                  : `/merchants?merchantId=${merchant.id}`;

                return (
                  <a
                    key={merchant.id}
                    href={merchantHref}
                    className="group relative block"
                    aria-label={
                      isComingSoon
                        ? `${merchant.name} is coming soon on Fareback`
                        : `Shop at ${merchant.name} and earn up to ${merchant.cashbackRate} cashback`
                    }
                  >
                    <Card className="relative h-full overflow-hidden border-border/50 bg-background/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <CardHeader className="relative z-10 items-center pb-2">
                        {merchant.logoUrl ? (
                          <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-white p-3 shadow-sm transition-transform duration-500 group-hover:scale-110">
                            <Image
                              src={merchant.logoUrl}
                              alt={`${merchant.name} logo`}
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                          </div>
                        ) : null}
                        <CardTitle className="text-center text-lg font-bold">
                          {merchant.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10 pb-6 text-center">
                        <div className="inline-block rounded-full bg-primary/10 px-3 py-1">
                          <CardDescription className="text-sm font-bold text-primary">
                            Upto {merchant.cashbackRate}*
                          </CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="tracked-history" className="border-b border-border/40 bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Your Earning Dashboard
            </h2>
            <p className="text-lg text-muted-foreground">
              Total transparency. Watch your pending rewards transition to withdrawable cash in real time.
            </p>
          </div>

          <div className="mx-auto max-w-4xl rounded-3xl border border-border/50 bg-card p-6 shadow-xl md:p-10">
            {user ? (
              <TrackedHistory items={trackedItems} />
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Track Your Progress</h3>
                <p className="mx-auto mb-8 max-w-md text-lg text-muted-foreground">
                  Sign in to view your cashback history, monitor pending approvals, and request UPI payouts.
                </p>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="faq" className="relative overflow-hidden bg-muted/5 py-24">
        <div className="container relative z-10 mx-auto max-w-4xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              How It All Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about earning and withdrawing with Fareback.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              {
                q: "How long does it take to track my purchase?",
                a: "Purchases are typically tracked within 48 hours of completion. You'll see the transaction appear in your earning dashboard as pending once confirmed.",
              },
              {
                q: "When can I withdraw my cashback rewards?",
                a: "Rewards become available for withdrawal after the merchant return period ends, usually 30-60 days. Once confirmed, you can withdraw via UPI.",
              },
              {
                q: "Is there a minimum withdrawal amount?",
                a: "There is no minimum. You can request a UPI withdrawal for any approved amount in your wallet.",
              },
              {
                q: "How do I ensure my purchase tracks correctly?",
                a: "Start with an empty cart, click through Fareback, and complete your purchase in the same browser window without external coupon tools.",
              },
              {
                q: "Do my credit card offers and merchant offers still apply?",
                a: "Yes. Bank discounts, card offers, and merchant site-wide deals remain valid. Fareback cashback is designed to stack on top whenever the order is tracked successfully.",
              },
            ].map(({ q, a }) => (
              <Card key={q} className="group border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-bold">
                    {q}
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">{a}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="relative mt-20 overflow-hidden rounded-3xl border border-border/50 bg-card p-10 text-center shadow-2xl">
            <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-primary to-amber-500" />
            <h2 className="mb-4 text-3xl font-bold">Ready to stop overpaying?</h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Join smart shoppers earning real cashback on everyday purchases. It takes a few seconds to sign up.
            </p>
            {user ? (
              <ShopNowButton className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all hover:scale-105 hover:bg-primary/90" />
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all hover:scale-105 hover:bg-primary/90"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
