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
import { clicks, merchants, walletTransactions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import HeroCarousel from "@/components/hero-carousel";
import TrackedHistory, { type TrackedHistoryItem } from "@/components/tracked-history";

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

  const favoritePlatform = await getFavoritePlatform(
    user?.id ?? null,
    merchantList,
  );

  let trackedItems: TrackedHistoryItem[] = [];
  if (user) {
    try {
      const txs = await db
        .select()
        .from(walletTransactions)
        .where(eq(walletTransactions.userId, user.id))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(20);

      trackedItems = txs
        .filter((tx) => tx.type === "credit")
        .map((tx) => ({
          id: tx.id,
          merchantName: tx.note ?? "Purchase",
          clickDate: tx.createdAt,
          rewardAmount: tx.amountInPaise,
          adminApproved: true,
        }));
    } catch (error) {
      console.error("Failed to fetch tracked history:", error);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/40 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Fareback</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Shop on your favorite stores through Fareback and earn cashback.
            We track your eligible clicks and manually update wallet rewards after affiliate commissions are confirmed.
          </p>
        </div>
      </section>

      {/* Instructions Carousel */}
      <HeroCarousel favoritePlatform={favoritePlatform} />

      {/* Cashback Partners */}
      <section id="offers" className="border-b border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cashback Partners
            </h2>
            <p className="mt-4 text-muted-foreground">
              Shop through our partners and earn cashback on every purchase.
            </p>
          </div>

          {merchantList.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No merchants available yet. Check back soon!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {merchantList.map((merchant) => (
                <a
                  key={merchant.id}
                  href={`/api/redirect?merchantId=${merchant.id}`}
                  className="block"
                  aria-label={`Shop at ${merchant.name} and earn up to ${merchant.cashbackRate} cashback`}
                >
                  <Card className="border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg">
                    <CardHeader className="items-center pb-2">
                      {merchant.logoUrl ? (
                        <div className="mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-white p-1">
                          <Image
                            src={merchant.logoUrl}
                            alt={`${merchant.name} logo`}
                            width={40}
                            height={40}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <CardTitle className="text-center text-base">
                        {merchant.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="font-medium text-primary">
                        up to {merchant.cashbackRate} cashback*
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
      <section id="tracked-history" className="border-b border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tracked History
            </h2>
            <p className="mt-4 text-muted-foreground">
              Your cashback rewards tracked and approved by admin.
            </p>
          </div>
          {user ? (
            <TrackedHistory items={trackedItems} />
          ) : (
            <p className="text-center text-muted-foreground">
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to view your tracked rewards.
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/40 py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">FAQ</h2>
          <div className="mt-8 space-y-4">
            {[
              {
                q: "How much time will it take to track purchase?",
                a: "usually 48 hrs",
              },
              {
                q: "When the reward became available to redeem?",
                a: "After the cancelation period over",
              },
              {
                q: "Is there any minimum amount to redeem?",
                a: "No, You can request for any amount",
              },
              {
                q: "Which methods are available for payouts?",
                a: "Currently only upi payout option is available for payout",
              },
            ].map(({ q, a }) => (
              <Card key={q}>
                <CardHeader>
                  <CardTitle className="text-base">{q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{a}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/sign-in" className="text-primary hover:underline">
              Create your Fareback account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Page;
