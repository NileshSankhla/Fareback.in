import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema";

const TEST_CASHBACK_RATE = "2%";

const Page = async () => {
  let merchantList: (typeof merchants.$inferSelect)[] = [];

  try {
    merchantList = await db.select().from(merchants);
  } catch (error) {
    console.error("Failed to fetch merchants:", error);
  }

  return (
    <>
      <section className="border-b border-border/40 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Fareback</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Shop on your favorite stores through Fareback and earn cashback.
            We track your eligible clicks and manually update wallet rewards after affiliate commissions are confirmed.
          </p>
        </div>
      </section>

      <section id="offers" className="border-b border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cashback Offers
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
                  aria-label={`Shop at ${merchant.name} and earn ${TEST_CASHBACK_RATE} cashback`}
                >
                  <Card className="border-border/60 bg-card/50 backdrop-blur-sm transition-all hover:shadow-md hover:scale-105">
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
                        {TEST_CASHBACK_RATE}
                      </CardDescription>
                      <CardDescription className="mt-1 text-xs">cashback</CardDescription>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How Cashback Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Simple process for users while payouts are handled manually by admin.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "1. Sign In",
                description: "Create your account and access your wallet section.",
              },
              {
                title: "2. Shop Through Fareback",
                description: "Click store cards and complete shopping on partner websites.",
              },
              {
                title: "3. Withdraw to UPI",
                description: "Request withdrawal from dashboard when wallet has available balance.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-border/40 py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">FAQ</h2>
          <div className="mt-8 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">When does wallet update?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Wallet updates are done manually by admin after affiliate commissions are confirmed by partner networks.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How do I withdraw?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Go to your dashboard, enter UPI ID and amount, then submit a withdrawal request.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need help?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Contact support at nileshsankhlakgp@gmail.com
                </CardDescription>
              </CardContent>
            </Card>
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
