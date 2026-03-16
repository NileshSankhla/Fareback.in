"use client";

import { Moon, Sun } from "lucide-react";

import { useThemeSwitcher } from "@/hooks/use-theme";
import { Button } from "./ui/button";

const ThemeSwitcher = () => {
  const { resolvedTheme, toggleTheme, mounted } = useThemeSwitcher();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <span className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeSwitcher;
