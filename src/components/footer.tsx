import Link from "next/link";
import { Code2, Github, Twitter } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/40 bg-background">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Code2 className="h-6 w-6 text-primary" />
            <span>CashbackCart</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            CashbackCart lets users shop via affiliate offers and withdraw
            earnings through UPI requests handled by admin.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="https://github.com"
              aria-label="GitHub"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com"
              aria-label="Twitter"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Product</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="#offers"
                className="transition-colors hover:text-foreground"
              >
                Offers
              </Link>
            </li>
            <li>
              <Link
                href="#how-it-works"
                className="transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link
                href="/sign-up"
                className="transition-colors hover:text-foreground"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} CashbackCart. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
