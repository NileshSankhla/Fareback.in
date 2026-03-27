import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import FooterNavLink from "@/components/footer-nav-link";

const Footer = () => {
  return (
  <footer className="border-t border-border/40 bg-background">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <FooterNavLink href="/" className="flex items-center transition-opacity hover:opacity-80" ariaLabel="Fareback home">
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
          </FooterNavLink>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
            India&apos;s trusted cashback platform. Shop from top brands,
            earn guaranteed rewards, and withdraw via UPI.
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/fareback.inn/"}
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
              <FooterNavLink
                href="/#offers"
                className="transition-colors hover:text-foreground"
              >
                Cashback Offers
              </FooterNavLink>
            </li>
            <li>
              <FooterNavLink
                href="/#how-it-works"
                className="transition-colors hover:text-foreground"
              >
                How It Works
              </FooterNavLink>
            </li>
            <li>
              <FooterNavLink
                href="/#faq"
                className="transition-colors hover:text-foreground"
              >
                FAQs
              </FooterNavLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Legal</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <FooterNavLink
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy Policy
              </FooterNavLink>
            </li>
            <li>
              <FooterNavLink
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms and Conditions
              </FooterNavLink>
            </li>
            <li>
              <FooterNavLink
                href="/affiliate-rates"
                className="transition-colors hover:text-foreground"
              >
                *Cashback Rates
              </FooterNavLink>
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
