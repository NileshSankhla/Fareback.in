"use client";

import { useState, useEffect, useCallback, type TouchEvent } from "react";
import { ArrowRight } from "lucide-react";

interface HeroCarouselProps {
  favoritePlatform: string;
}

const HeroCarousel = ({ favoritePlatform }: HeroCarouselProps) => {
  const slides = [
    {
      title: "Create Your Free Account",
      description: "Sign in with Google to get started.",
    },
    {
      title: "Choose Your Favorite Store",
      description: `Click on ${favoritePlatform} or any partner store to redirect securely to their website.`,
    },
    {
      title: "Shop As Usual",
      description: "Ensure your cart is empty before clicking. Add items and complete purchase after redirecting for guaranteed tracking.",
    },
    {
      title: "Automatic Purchase Tracking",
      description: "Your purchase is tracked within 48 hours and appears in your earning history with full details.",
    },
    {
      title: "Withdraw Your Earnings",
      description: "You can request Earned Amount after 30 Days of Purchase",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(next, 8000);
    return () => clearInterval(interval);
  }, [next]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = touchStartX - touchEndX;
    const swipeThreshold = 40;

    if (delta > swipeThreshold) {
      next();
    } else if (delta < -swipeThreshold) {
      prev();
    }

    setTouchStartX(null);
  };

  return (
    <section id="how-it-works" className="border-b border-border/40 bg-gradient-to-b from-muted/40 to-muted/20 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How Fareback Works
          </h2>
          <div
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="px-8 py-12 sm:px-12">
              <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                Step {current + 1} of {slides.length}
              </div>
              <div className="min-h-[140px] space-y-4">
                <h3 className="text-2xl font-bold text-card-foreground sm:text-3xl">
                  {slides[current].title}
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {slides[current].description}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current ? "w-8 bg-primary" : "w-2 bg-border hover:bg-border/70"
                      }`}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="hidden gap-2 sm:flex">
                  <button
                    onClick={prev}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-accent hover:scale-105"
                    aria-label="Previous step"
                  >
                    <ArrowRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    onClick={next}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-accent hover:scale-105"
                    aria-label="Next step"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
