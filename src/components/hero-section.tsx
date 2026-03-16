import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => (
  <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden py-20 text-center">
    {/* Background gradient blobs */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/4 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/4 rounded-full bg-gradient-to-tl from-pink-500/20 via-rose-500/10 to-transparent blur-3xl" />
    </div>

    {/* Badge */}
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      <span>Production-ready Next.js 16 foundation</span>
    </div>

    {/* Headline */}
    <h1 className="max-w-4xl bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl">
      Build Faster.
      <br />
      Ship&nbsp;
      <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        Smarter.
      </span>
    </h1>

    {/* Subheadline */}
    <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
      A high-performance web foundation powered by Next.js&nbsp;16, Bun,
      TypeScript, Tailwind&nbsp;CSS&nbsp;v4, and Drizzle&nbsp;ORM — everything
      you need to go from idea to production in record time.
    </p>

    {/* CTA buttons */}
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <Button size="lg" asChild>
        <Link href="/sign-up">
          Get Started Free
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
      <Button variant="outline" size="lg" asChild>
        <Link href="https://github.com/NileshSankhla/my-modern-web">
          View on GitHub
        </Link>
      </Button>
    </div>

    {/* Tech stack pills */}
    <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
      {[
        { label: "Next.js 16", icon: "⚡" },
        { label: "Bun", icon: "🥟" },
        { label: "TypeScript", icon: "🔷" },
        { label: "Tailwind CSS v4", icon: "🎨" },
        { label: "Drizzle ORM", icon: "🗄️" },
        { label: "Shadcn/UI", icon: "🧱" },
      ].map(({ label, icon }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
        >
          <span>{icon}</span>
          {label}
        </span>
      ))}
    </div>

    {/* Scroll indicator */}
    <div className="mt-20 flex flex-col items-center gap-2 text-xs text-muted-foreground/60">
      <Zap className="h-4 w-4 animate-bounce" />
      <span>Scroll to explore</span>
    </div>
  </section>
);

export default HeroSection;
