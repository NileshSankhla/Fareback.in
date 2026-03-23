"use client";

import React from "react";
import { useCustomScroll } from "@/hooks/use-custom-scroll";

interface SmoothScrollLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Duration of the scroll animation in milliseconds
   * @default 1200 for desktop, 1000 for mobile
   */
  duration?: number;
  /**
   * Offset from the target position in pixels
   * Useful for fixed headers
   * @default 0
   */
  offset?: number;
}

const SmoothScrollLink = React.forwardRef<HTMLAnchorElement, SmoothScrollLinkProps>(
  ({ href, children, onClick, duration, offset = 0, ...props }, ref) => {
    const scrollToElement = useCustomScroll();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Detect if device has coarse pointer (typically mobile/touch devices)
          // Mobile devices get slightly faster animation to feel more responsive
          const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
          const scrollDuration = duration ?? (isCoarsePointer ? 1000 : 1200);

          scrollToElement(targetElement, scrollDuration, offset);
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
