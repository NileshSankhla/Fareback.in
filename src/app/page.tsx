import HeroSection from "@/components/hero-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const Page = () => (
  <>
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
  </>
);

export default Page;
