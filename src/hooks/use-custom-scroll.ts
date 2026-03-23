"use client";

import { useCallback } from "react";

/**
 * Quartic ease-out easing function
 * Starts fast and gracefully slows down as it reaches the target
 * Formula: 1 - (1 - t)^4
 *
 * This provides a more pronounced ease-out effect compared to cubic,
 * ensuring consistent behavior across all devices and browsers.
 */
const easeOutQuartic = (t: number): number => {
  return 1 - Math.pow(1 - t, 4);
};

/**
 * Custom scroll utility that uses requestAnimationFrame for smooth,
 * consistent scrolling across all devices and browsers.
 *
 * This bypasses the browser's native scroll behavior which can be
 * inconsistent (especially on mobile where it may start slow and speed up).
 *
 * @param targetElement - The HTML element to scroll to
 * @param duration - Duration of the scroll animation in milliseconds (default: 1200)
 * @param offset - Optional offset from the target position in pixels (default: 0)
 */
const smoothScrollTo = (
  targetElement: HTMLElement,
  duration: number = 1200,
  offset: number = 0
): void => {
  // Grab the HTML element and store its current scroll behavior
  const htmlElement = document.documentElement;
  const originalScrollBehavior = htmlElement.style.scrollBehavior;

  // Force the browser to jump instantly for our JS calculations,
  // preventing CSS smooth scrolling from interfering with each animation frame
  // (especially on mobile Safari where stacked CSS glides cause lag/stuttering)
  htmlElement.style.scrollBehavior = 'auto';

  const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  const animateScroll = (currentTime: number): void => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Apply the ease-out quartic curve
    const easedProgress = easeOutQuartic(progress);

    // Calculate the new scroll position
    const newPosition = startPosition + distance * easedProgress;

    // Perform the scroll
    window.scrollTo(0, newPosition);

    // Continue animation if not complete
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      // Restore the original CSS behavior once the animation is completely finished
      htmlElement.style.scrollBehavior = originalScrollBehavior;
    }
  };

  requestAnimationFrame(animateScroll);
};

/**
 * Custom React hook for smooth scrolling functionality
 *
 * @returns A function that smoothly scrolls to a target element
 *
 * @example
 * ```tsx
 * const scrollToElement = useCustomScroll();
 *
 * const handleClick = () => {
 *   const target = document.getElementById('offers');
 *   if (target) {
 *     scrollToElement(target, 1200);
 *   }
 * };
 * ```
 */
export const useCustomScroll = () => {
  const scrollToElement = useCallback(
    (targetElement: HTMLElement, duration?: number, offset?: number) => {
      smoothScrollTo(targetElement, duration, offset);
    },
    []
  );

  return scrollToElement;
};

/**
 * Utility function to scroll to an element by ID
 *
 * @param elementId - The ID of the target element (without the # symbol)
 * @param duration - Duration of the scroll animation in milliseconds (default: 1200)
 * @param offset - Optional offset from the target position in pixels (default: 0)
 * @returns true if the element was found and scroll initiated, false otherwise
 */
export const scrollToElementById = (
  elementId: string,
  duration: number = 1200,
  offset: number = 0
): boolean => {
  const targetElement = document.getElementById(elementId);

  if (targetElement) {
    smoothScrollTo(targetElement, duration, offset);
    return true;
  }

  return false;
};

export default useCustomScroll;
