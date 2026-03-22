import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://fareback.in"),
  title: {
    default: "Fareback",
    template: "%s | Fareback",
  },
  description:
    "Fareback helps users shop via affiliate offers and request UPI withdrawals from earned cashback.",
  keywords: ["cashback", "affiliate", "wallet", "UPI", "shopping"],
  authors: [{ name: "Fareback" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
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
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning>
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
