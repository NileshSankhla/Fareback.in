"use client";

import { useState, useEffect, useCallback } from "react";

interface HeroCarouselProps {
  favoritePlatform: string;
}

const HeroCarousel = ({ favoritePlatform }: HeroCarouselProps) => {
  const slides = [
    "Sign With Your Google account to get started",
    `Then click to ${favoritePlatform} to redirect to platform`,
    "Make sure your cart initially empty, Add goods to cart or buy only after redirecting",
    "After successful purchase it will take 48 hrs to track the purchase",
    "You can redeem your amount after the cancelation period is over on your purchase",
  ];

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className="border-b border-border/40 bg-muted/40 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
            How to Use Fareback
          </h2>
          <div className="relative min-h-[120px] overflow-hidden rounded-xl border border-border/60 bg-card px-8 py-10 shadow-sm">
            <p className="text-lg text-card-foreground">
              <span className="font-semibold text-primary">Step {current + 1}:</span>{" "}
              {slides[current]}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-6 bg-primary" : "w-2 bg-border"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
