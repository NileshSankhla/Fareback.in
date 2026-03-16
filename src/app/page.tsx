import HeroSection from "@/components/hero-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema";
import { Database, Palette, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "Powered by Bun runtime and Next.js 16 App Router with React Server Components for optimal performance.",
  },
  {
    icon: Palette,
    title: "Beautiful UI",
    description:
      "Shadcn/UI components with Tailwind CSS v4, dark mode by default, and animated gradients out of the box.",
  },
  {
    icon: Database,
    title: "Type-Safe Database",
    description:
      "Drizzle ORM with PostgreSQL gives you edge-compatible, fully type-safe database access with zero overhead.",
  },
  {
    icon: Shield,
    title: "Auth Ready",
    description:
      "Authentication scaffolding with Zod validation, ready to integrate with NextAuth or Clerk in minutes.",
  },
];

const Page = async () => {
  const merchantList = await db.select().from(merchants);

  return (
    <>
      <section id="merchants" className="border-b border-border/40 py-20">
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {merchantList.map((merchant) => (
                <a
                  key={merchant.id}
                  href={`/api/redirect?merchantId=${merchant.id}`}
                  className="block"
                >
                  <Card className="border-border/60 bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {merchant.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Earn {merchant.cashbackRate} cashback
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <HeroSection />

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-muted-foreground">
              A carefully curated tech stack to help you build and ship faster
              than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="border-border/60 bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Real Products
            </h2>
            <p className="mt-4 text-muted-foreground">
              This starter combines a polished frontend with strict typing,
              validation, and database scaffolding so you can focus on business
              logic instead of setup.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple Pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free and scale only when your product grows.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>For early-stage projects.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$0</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Includes auth scaffolding, theming, and database schema.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For production applications.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$29</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Adds analytics, advanced auth providers, and team workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-border/40 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Contact
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Questions about implementation, deployment, or customization? Reach
            us at hello@my-modern-web.dev.
          </p>
        </div>
      </section>
    </>
  );
};

export default Page;
