import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    "Fareback helps users shop via affiliate offers and request UPI withdrawals from earned cashback.",
  keywords: ["cashback", "affiliate", "wallet", "UPI", "shopping"],
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
      "Affiliate cashback made simple with manual wallet and withdrawal management.",
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

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
    <body className="min-h-screen bg-background font-sans antialiased">
      <Providers>
        <div className="relative flex min-h-screen flex-col">
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

export default RootLayout;
