import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const THEME_COOKIE_KEY = "fareback_theme";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://fareback.in"),
   other: {
    "verify-admitad": "081ea0ef0d",
  },
  title: {
    default: "Fareback",
    template: "%s | Fareback",
  },
  description:
    "Fareback helps users shop via affiliate offers, withdraw cashback, and convert Amazon rewards into gift cards.",
  keywords: ["cashback", "affiliate", "wallet", "UPI", "shopping", "amazon rewards"],
  authors: [{ name: "Fareback" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Fareback",
    description:
      "Shop through Fareback partner cards, track eligibility, and request withdrawals to UPI.",
    siteName: "Fareback",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fareback",
    description:
      "Affiliate cashback and Amazon gift-card rewards made simple with manual wallet and conversion management.",
  },
  icons: {
    icon: [
      {
        url: "/favicon-black.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-white.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/favicon-black.svg",
    shortcut: [
      {
        url: "/favicon-black.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-white.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const themeClass = themeCookie === "light" ? "" : "dark";

  return (
    <html lang="en" className={themeClass} suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div
            id="booster_root"
            suppressHydrationWarning
            className="relative flex min-h-screen flex-col"
          >
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
