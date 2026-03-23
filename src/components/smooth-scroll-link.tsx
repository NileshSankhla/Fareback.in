"use client";

import React from "react";

interface SmoothScrollLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const smoothScrollTo = (element: HTMLElement, duration: number) => {
  const targetPosition = element.getBoundingClientRect().top + window.scrollY;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  const easeOutCubic = (t: number): number => {
    return 1 - (1 - t) ** 3;
  };

  const scroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeOutCubic(progress);

    window.scrollTo(0, startPosition + distance * ease);

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  };

  requestAnimationFrame(scroll);
};

const SmoothScrollLink = React.forwardRef<HTMLAnchorElement, SmoothScrollLinkProps>(
  ({ href, children, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
          const duration = isCoarsePointer ? 1100 : 1500;
          smoothScrollTo(targetElement, duration);
        }
      }

      onClick?.(e);
    };

    return (
      <a ref={ref} href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  },
);

SmoothScrollLink.displayName = "SmoothScrollLink";

export default SmoothScrollLink;
