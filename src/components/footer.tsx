import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const Footer = async () => {
  const user = await getCurrentUser();

  return (
  <footer className="border-t border-border/40 bg-background">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80" aria-label="Fareback home">
            <Image
              src="/brand-name-dark.svg"
              alt="Fareback"
              width={164}
              height={64}
              className="h-9 w-auto dark:hidden"
            />
            <Image
              src="/brand-name-light.svg"
              alt="Fareback"
              width={164}
              height={64}
              className="hidden h-9 w-auto dark:block"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
            India&apos;s trusted cashback platform. Shop from top brands,
            earn guaranteed rewards, and withdraw via UPI.
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/fareback.in/"}
              aria-label="Follow us on Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <a
              href="mailto:support@fareback.in"
              aria-label="Email Support"
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary text-sm"
            >
              <Mail className="h-5 w-5" />
              <span>Support</span>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Platform</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <Link
                href="#offers"
                className="transition-colors hover:text-foreground"
              >
                Cashback Offers
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
                href="#faq"
                className="transition-colors hover:text-foreground"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href={user ? "/#offers" : "/sign-in"}
                className="transition-colors hover:text-foreground font-medium"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Legal</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
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
            <li>
              <Link
                href="/affiliate-rates"
                className="transition-colors hover:text-foreground"
              >
                Affiliate Rates
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Fareback. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
