import Link from "next/link";
import { Code2 } from "lucide-react";
import ThemeSwitcher from "./theme-switcher";
import { Button } from "./ui/button";

const Navbar = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <Code2 className="h-6 w-6 text-primary" />
        <span>my-modern-web</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link
          href="#features"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Features
        </Link>
        <Link
          href="#about"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          About
        </Link>
        <Link
          href="#contact"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Contact
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Button variant="outline" size="sm" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>
    </div>
  </header>
);

export default Navbar;
