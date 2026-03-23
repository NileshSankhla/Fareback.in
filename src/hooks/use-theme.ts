"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export const useThemeSwitcher = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return { theme, resolvedTheme, setTheme, toggleTheme, mounted };
};
