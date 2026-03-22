import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { ensureWalletForUser, formatPaiseAsINR } from "@/lib/wallet";
import ThemeSwitcher from "./theme-switcher";
import { Button } from "./ui/button";

const Navbar = async () => {
  const user = await getCurrentUser();
  const wallet = user ? await ensureWalletForUser(user.id) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Fareback home"
        >
          <Image
            src="/brand-name-dark.svg"
            alt="Fareback"
            width={164}
            height={64}
            className="h-9 w-auto dark:hidden"
            priority
          />
          <Image
            src="/brand-name-light.svg"
            alt="Fareback"
            width={164}
            height={64}
            className="hidden h-9 w-auto dark:block"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="#offers"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Offers
          </Link>
          <Link
            href="#how-it-works"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="#faq"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {user ? (
            <>
              <span className="hidden text-xs text-muted-foreground md:inline">
                Wallet: {formatPaiseAsINR(wallet?.balanceInPaise ?? 0)}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              {user.isAdmin ? (
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              ) : null}
              <form action={signOutAction}>
                <Button size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/sign-in">SignUp/SignIn</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
